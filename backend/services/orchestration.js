import { AssemblyAIService } from './assemblyai.js';
import { GeminiService } from './gemini.js';
import { AudioJobModel } from '../audioJobs/audioJobModel.js';
import fs from 'fs';
import path from 'path';

export class AudioOrchestrationService {
  constructor() {
    this.assemblyAI = new AssemblyAIService();
    this.gemini = new GeminiService();
    this.audioJobModel = new AudioJobModel();
  }

  generateReportTitle(transcriptData) {
    // Try to generate a smart title based on content
    const text = transcriptData.text || '';
    const words = text.split(' ').slice(0, 50).join(' '); // First 50 words
    
    // Look for meeting-like keywords
    if (words.toLowerCase().includes('meeting') || words.toLowerCase().includes('discussion')) {
      return 'Meeting Discussion Report';
    } else if (words.toLowerCase().includes('interview')) {
      return 'Interview Analysis Report';
    } else if (words.toLowerCase().includes('presentation')) {
      return 'Presentation Summary Report';
    } else {
      return 'Conversation Analysis Report';
    }
  }

  formatTranscriptForReport(transcriptData) {
    // Convert utterances to a format suitable for the report
    if (transcriptData.utterances && transcriptData.utterances.length > 0) {
      return transcriptData.utterances.map((utterance, index) => ({
        speaker: utterance.speaker || 'Unknown',
        start: utterance.start,
        end: utterance.end,
        text: utterance.text,
        confidence: utterance.confidence,
        segment_id: index + 1
      }));
    }
    
    // Fallback if no utterances available
    return [{
      speaker: 'A',
      start: 0,
      end: transcriptData.audio_duration || 0,
      text: transcriptData.text || 'No transcript available',
      confidence: transcriptData.confidence || 0,
      segment_id: 1
    }];
  }ructor() {
    this.assemblyAI = new AssemblyAIService();
    this.gemini = new GeminiService();
    this.audioJobModel = new AudioJobModel();
  }

  async processAudioFile(jobId, filePath, options = {}) {
    let job;
    
    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'transcribing', {
        processing_started_at: new Date().toISOString()
      });

      // Step 1: Transcribe with AssemblyAI (auto-detect speakers)
      console.log(`Starting transcription for job ${jobId}`);
      const transcriptionResult = await this.assemblyAI.transcribeAudio(filePath, {
        // Let AssemblyAI automatically detect the optimal number of speakers
      });

      if (!transcriptionResult.success) {
        throw new Error(`Transcription failed: ${transcriptionResult.error}`);
      }

      const transcriptData = transcriptionResult.data;

      // Update job with transcription results (with cache-aware updates)
      try {
        await this.updateJobStatus(jobId, 'analyzing', {
          transcript_id: transcriptData.id,
          transcript_data: transcriptData,
          audio_duration: transcriptData.audio_duration,
          confidence_score: transcriptData.confidence,
          speaker_count: transcriptData.speakers?.length || 0,
          language_detected: transcriptData.language_code
        });
      } catch (error) {
        console.warn('Full update failed, trying basic update:', error.message);
        // Fallback to basic update if cache issues persist
        await this.updateJobStatus(jobId, 'analyzing', {
          transcript_data: transcriptData
        });
      }

      // Step 2: Analyze with Gemini
      console.log(`Starting AI analysis for job ${jobId}`);
      const analysisResult = await this.gemini.analyzeTranscript(
        transcriptData, 
        options.analysisType || 'comprehensive'
      );

      if (!analysisResult.success) {
        throw new Error(`Analysis failed: ${analysisResult.error}`);
      }

      // Step 3: Generate summary
      const summaryResult = await this.gemini.generateSummary(
        transcriptData,
        options.summaryType || 'executive'
      );

      if (!summaryResult.success) {
        throw new Error(`Summary generation failed: ${summaryResult.error}`);
      }

      // Step 4: Save all results
      const finalResults = {
        transcript: transcriptData,
        analysis: analysisResult.data,
        summary: summaryResult.data
      };

      // Update job to completed with proper column names
      await this.updateJobStatus(jobId, 'completed', {
        analysis_data: analysisResult.data,  // Store analysis data
        report_data: {
          title: this.generateReportTitle(transcriptData),
          executive_summary: summaryResult.data.content,
          key_points: analysisResult.data.summary?.key_points || analysisResult.data.content_insights?.key_decisions || [],
          action_items: this.formatActionItems(analysisResult.data),
          full_transcript: this.formatTranscriptForReport(transcriptData),
          metadata: {
            duration: transcriptData.audio_duration,
            speakers_count: transcriptData.speakers?.length || 0,
            processed_at: new Date().toISOString()
          }
        },
        processing_completed_at: new Date().toISOString()
      });

      // Clean up uploaded file if needed
      if (options.deleteFileAfterProcessing) {
        this.cleanupFile(filePath);
      }

      console.log(`Processing completed for job ${jobId}`);
      
      return {
        success: true,
        data: {
          jobId,
          status: 'completed',
          results: finalResults
        }
      };

    } catch (error) {
      console.error(`Processing failed for job ${jobId}:`, error);
      
      // Update job status to failed (with cache-aware fallback)
      try {
        await this.updateJobStatus(jobId, 'failed', {
          error_message: error.message,
          processing_completed_at: new Date().toISOString()
        });
      } catch (updateError) {
        console.warn('Failed update error, trying basic update:', updateError.message);
        // Fallback to basic update if cache issues persist
        await this.updateJobStatus(jobId, 'failed', {
          error_message: error.message
        });
      }

      return {
        success: false,
        error: error.message,
        jobId
      };
    }
  }

  async updateJobStatus(jobId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      await this.audioJobModel.updateJob(jobId, updateData);
      console.log(`Job ${jobId} status updated to: ${status}`);
    } catch (error) {
      console.error(`Failed to update job ${jobId} status:`, error);
      throw error;
    }
  }

  async getProcessingStatus(jobId) {
    try {
      const job = await this.audioJobModel.getJobById(jobId);
      
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      // If job has a transcript_id and is still transcribing, check AssemblyAI status
      if (job.transcript_id && job.status === 'transcribing') {
        const transcriptStatus = await this.assemblyAI.getTranscriptStatus(job.transcript_id);
        
        if (transcriptStatus.success && transcriptStatus.data.completed) {
          // Continue processing if transcription is complete
          this.processTranscriptionComplete(jobId);
        }
      }

      return {
        success: true,
        data: {
          id: job.id,
          status: job.status,
          progress: this.calculateProgress(job.status),
          created_at: job.created_at,
          processing_started_at: job.processing_started_at,
          processing_completed_at: job.processing_completed_at,
          error_message: job.error_message
        }
      };

    } catch (error) {
      console.error(`Error getting processing status for job ${jobId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateProgress(status) {
    const progressMap = {
      'uploaded': 10,
      'transcribing': 40,
      'analyzing': 70,
      'completed': 100,
      'failed': 0
    };
    
    return progressMap[status] || 0;
  }

  async processTranscriptionComplete(jobId) {
    // This method continues processing after transcription is complete
    // Implementation would continue from Step 2 of processAudioFile
    console.log(`Continuing processing for job ${jobId} after transcription completion`);
  }

  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }

  async validateAudioFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      // Check file size (max 100MB)
      if (fileSizeInMB > 100) {
        return {
          valid: false,
          error: 'File size exceeds 100MB limit'
        };
      }

      // Check file exists and is readable
      fs.accessSync(filePath, fs.constants.R_OK);

      return {
        valid: true,
        size: stats.size,
        sizeInMB: fileSizeInMB
      };

    } catch (error) {
      return {
        valid: false,
        error: `File validation failed: ${error.message}`
      };
    }
  }

  generateReportTitle(transcriptData) {
    // Try to generate a smart title based on content
    const text = transcriptData.text || '';
    const words = text.split(' ').slice(0, 50).join(' '); // First 50 words
    
    // Look for meeting-like keywords
    if (words.toLowerCase().includes('meeting') || words.toLowerCase().includes('discussion')) {
      return 'Meeting Discussion Report';
    } else if (words.toLowerCase().includes('interview')) {
      return 'Interview Analysis Report';
    } else if (words.toLowerCase().includes('presentation')) {
      return 'Presentation Summary Report';
    } else {
      return 'Conversation Analysis Report';
    }
  }

  formatTranscriptForReport(transcriptData) {
    // Convert utterances to a format suitable for the report
    if (transcriptData.utterances && transcriptData.utterances.length > 0) {
      return transcriptData.utterances.map((utterance, index) => ({
        speaker: utterance.speaker || 'Unknown',
        start: utterance.start,
        end: utterance.end,
        text: utterance.text,
        confidence: utterance.confidence,
        segment_id: index + 1
      }));
    }
    
    // Fallback if no utterances available
    return [{
      speaker: 'A',
      start: 0,
      end: transcriptData.audio_duration || 0,
      text: transcriptData.text || 'No transcript available',
      confidence: transcriptData.confidence || 0,
      segment_id: 1
    }];
  }

  formatActionItems(analysisData) {
    // Try to get action items from different possible locations in the analysis
    let actionItems = [];
    
    // Check content_insights.action_items (comprehensive analysis)
    if (analysisData.content_insights?.action_items) {
      actionItems = analysisData.content_insights.action_items;
    }
    // Check action_items (meeting analysis)
    else if (analysisData.action_items) {
      actionItems = analysisData.action_items;
    }
    
    // Ensure action items have the correct structure
    return actionItems.map((item, index) => {
      // If it's just a string, convert to object
      if (typeof item === 'string') {
        return {
          task: item,
          assignee: null,
          priority: 'medium',
          due_date: null
        };
      }
      
      // If it's already an object, ensure all required fields exist
      return {
        task: item.task || item.action || item.description || `Action item ${index + 1}`,
        assignee: item.assignee || item.assigned_to || item.responsible || null,
        priority: item.priority || 'medium',
        due_date: item.due_date || item.deadline || null
      };
    });
  }
}
