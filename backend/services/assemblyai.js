import { AssemblyAI } from 'assemblyai';
import fs from 'fs';

export class AssemblyAIService {
  constructor() {
    this.client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    });
  }

  async transcribeAudio(filePath, options = {}) {
    try {
      // Read the audio file
      const audioData = fs.readFileSync(filePath);

      // Upload the file to AssemblyAI
      const uploadUrl = await this.client.files.upload(audioData);

      // Configure transcription options - let AssemblyAI auto-detect speakers
      const transcriptConfig = {
        audio_url: uploadUrl,
        speaker_labels: true, // Enable speaker diarization with auto-detection
        punctuate: true,
        format_text: true
      };

      // Note: Removed speakers_expected to let AssemblyAI automatically detect optimal number of speakers

      // Add advanced features one by one to avoid schema validation issues
      try {
        transcriptConfig.auto_chapters = true;
        transcriptConfig.sentiment_analysis = true;
        transcriptConfig.entity_detection = true;
        transcriptConfig.iab_categories = true;
        transcriptConfig.language_detection = true;
      } catch (configError) {
        console.warn('Some advanced features may not be available:', configError.message);
      }

      console.log('AssemblyAI transcript config:', JSON.stringify(transcriptConfig, null, 2));

      // Start transcription
      const transcript = await this.client.transcripts.transcribe(transcriptConfig);

      if (transcript.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
      }

      return {
        success: true,
        data: {
          id: transcript.id,
          text: transcript.text,
          confidence: transcript.confidence,
          audio_duration: transcript.audio_duration,
          speakers: this.extractSpeakerData(transcript),
          chapters: transcript.chapters || [],
          entities: transcript.entities || [],
          sentiment_analysis_results: transcript.sentiment_analysis_results || [],
          iab_categories_result: transcript.iab_categories_result || {},
          language_code: transcript.language_code,
          utterances: transcript.utterances || []
        }
      };

    } catch (error) {
      console.error('AssemblyAI transcription error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data',
        status: error.response?.status || 'No status',
        config: error.config || 'No config'
      });
      return {
        success: false,
        error: error.message,
        details: error.response?.data || error.stack
      };
    }
  }

  extractSpeakerData(transcript) {
    if (!transcript.utterances) {
      return [];
    }

    const speakers = {};
    
    transcript.utterances.forEach(utterance => {
      const speakerId = utterance.speaker;
      if (!speakers[speakerId]) {
        speakers[speakerId] = {
          speaker_id: speakerId,
          total_time: 0,
          word_count: 0,
          utterances: []
        };
      }
      
      speakers[speakerId].total_time += utterance.end - utterance.start;
      speakers[speakerId].word_count += utterance.words.length;
      speakers[speakerId].utterances.push({
        text: utterance.text,
        start: utterance.start,
        end: utterance.end,
        confidence: utterance.confidence
      });
    });

    return Object.values(speakers);
  }

  async getTranscriptStatus(transcriptId) {
    try {
      const transcript = await this.client.transcripts.get(transcriptId);
      return {
        success: true,
        data: {
          id: transcript.id,
          status: transcript.status,
          completed: transcript.status === 'completed',
          error: transcript.error
        }
      };
    } catch (error) {
      console.error('Error getting transcript status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
