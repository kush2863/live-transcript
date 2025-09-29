import { AudioJobModel } from './audioJobModel.js';
import { AudioOrchestrationService } from '../services/orchestration.js';
import path from 'path';
import fs from 'fs';

export class AudioJobController {
  constructor() {
    this.audioJobModel = new AudioJobModel();
    this.orchestrationService = new AudioOrchestrationService();
  }

  createJob = async (req, res) => {
    try {
      const { filename, file_path, file_size, mime_type } = req.body;
      const userId = req.user.id;

      if (!filename || !file_path) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: filename, file_path'
        });
      }

      const jobData = {
        user_id: userId,
        filename,
        file_path,
        file_size: file_size || null,
        mime_type: mime_type || null,
        status: 'uploaded'
      };

      const job = await this.audioJobModel.createJob(jobData, req.token);

      res.status(201).json({
        success: true,
        data: job,
        message: 'Audio job created successfully'
      });

    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create audio job'
      });
    }
  };

  getUserJobs = async (req, res) => {
    try {
      const userId = req.user.id;
      const { status, limit = 10, offset = 0 } = req.query;

      const filters = { user_id: userId };
      if (status) {
        filters.status = status;
      }

      const jobs = await this.audioJobModel.getJobsByUser(userId, {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }, req.token);

      res.json({
        success: true,
        data: jobs,
        count: jobs.length
      });

    } catch (error) {
      console.error('Get user jobs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio jobs'
      });
    }
  };

  getJobById = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const job = await this.audioJobModel.getJobById(id, req.token);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Audio job not found'
        });
      }

      // Ensure user can only access their own jobs
      if (job.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: job
      });

    } catch (error) {
      console.error('Get job by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audio job'
      });
    }
  };

  updateJob = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // First verify the job exists and belongs to the user
      const existingJob = await this.audioJobModel.getJobById(id, req.token);
      
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          error: 'Audio job not found'
        });
      }

      if (existingJob.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Update the job
      const updatedJob = await this.audioJobModel.updateJob(id, updates, req.token);

      res.json({
        success: true,
        data: updatedJob,
        message: 'Job updated successfully'
      });

    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update audio job'
      });
    }
  };

  startProcessing = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const options = req.body || {};

      // Verify job ownership
      const job = await this.audioJobModel.getJobById(id, req.token);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Audio job not found'
        });
      }

      if (job.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      if (job.status !== 'uploaded') {
        return res.status(400).json({
          success: false,
          error: `Cannot start processing. Current status: ${job.status}`
        });
      }

      // Validate the audio file exists
      const validation = await this.orchestrationService.validateAudioFile(job.file_path);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      // Start async processing (don't await)
      this.orchestrationService.processAudioFile(id, job.file_path, options)
        .then(result => {
          console.log(`Processing result for job ${id}:`, result.success ? 'Success' : 'Failed');
        })
        .catch(error => {
          console.error(`Processing error for job ${id}:`, error);
        });

      // Return immediate response
      res.json({
        success: true,
        data: {
          id: job.id,
          status: 'transcribing',
          message: 'Processing started'
        }
      });

    } catch (error) {
      console.error('Start processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start processing'
      });
    }
  };

  // New endpoint for uploading and creating jobs
  uploadAndCreateJob = async (req, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded'
        });
      }

      // Create job with file information
      const jobData = {
        user_id: userId,
        filename: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'uploaded'
      };

      const job = await this.audioJobModel.createJob(jobData, req.token);

      res.status(201).json({
        success: true,
        data: job,
        message: 'Audio file uploaded and job created successfully'
      });

    } catch (error) {
      console.error('Upload and create job error:', error);
      
      // Clean up uploaded file if job creation failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to upload file and create job'
      });
    }
  };

  // New endpoint for processing status
  getProcessingStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify job ownership
      const job = await this.audioJobModel.getJobById(id, req.token);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Audio job not found'
        });
      }

      if (job.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const statusResult = await this.orchestrationService.getProcessingStatus(id);

      if (!statusResult.success) {
        return res.status(500).json({
          success: false,
          error: statusResult.error
        });
      }

      res.json({
        success: true,
        data: statusResult.data
      });

    } catch (error) {
      console.error('Get processing status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get processing status'
      });
    }
  };

  // New endpoint for complete process (upload + process)
  processAudio = async (req, res) => {
    try {
      console.log('Processing audio - Auth check:', {
        hasUser: !!req.user,
        hasToken: !!req.token,
        userId: req.user?.id,
        authHeader: !!req.headers.authorization
      });

      const userId = req.user.id;
      const file = req.file;
      const options = req.body || {};

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file uploaded'
        });
      }

      // Create job
      const jobData = {
        user_id: userId,
        filename: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        status: 'uploaded'
      };

      const job = await this.audioJobModel.createJob(jobData, req.token);

      // Start processing immediately
      this.orchestrationService.processAudioFile(job.id, file.path, {
        ...options,
        deleteFileAfterProcessing: true // Clean up after processing
      })
        .then(result => {
          console.log(`Processing result for job ${job.id}:`, result.success ? 'Success' : 'Failed');
        })
        .catch(error => {
          console.error(`Processing error for job ${job.id}:`, error);
        });

      res.status(201).json({
        success: true,
        data: {
          id: job.id,
          status: 'transcribing',
          filename: job.filename,
          message: 'Audio uploaded and processing started'
        }
      });

    } catch (error) {
      console.error('Process audio error:', error);
      
      // Clean up uploaded file if job creation failed
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to process audio file'
      });
    }
  };
}
