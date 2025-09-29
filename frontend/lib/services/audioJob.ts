import { ApiResponse, AudioJob, AudioJobStatus } from '../types/audio';
import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class AudioJobService {
  
  // Get auth headers with token
  private async getAuthHeaders() {
    const token = await authService.ensureValidToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get auth headers for file upload (no Content-Type for FormData)
  private async getUploadHeaders() {
    const token = await authService.ensureValidToken();
    return {
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Upload audio file and create job
  async uploadAudio(file: File): Promise<ApiResponse<AudioJob>> {
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${API_BASE_URL}/audio/upload`, {
        method: 'POST',
        headers: await this.getUploadHeaders(),
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload audio file');
      }

      return data;
    } catch (error) {
      console.error('Upload audio error:', error);
      throw error;
    }
  }

  // Process audio file (upload + immediate processing)
  async processAudio(file: File, options?: {
    analysisType?: 'comprehensive' | 'meeting';
    summaryType?: 'executive' | 'detailed' | 'bullet_points';
  }): Promise<ApiResponse<AudioJob>> {
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      // Add options as form fields
      if (options?.analysisType) {
        formData.append('analysisType', options.analysisType);
      }
      if (options?.summaryType) {
        formData.append('summaryType', options.summaryType);
      }

      const response = await fetch(`${API_BASE_URL}/audio/process-audio`, {
        method: 'POST',
        headers: await this.getUploadHeaders(),
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process audio file');
      }

      return data;
    } catch (error) {
      console.error('Process audio error:', error);
      throw error;
    }
  }

  // Get processing status for a job
  async getProcessingStatus(jobId: string): Promise<ApiResponse<{
    id: string;
    status: AudioJobStatus;
    progress: number;
    created_at: string;
    processing_started_at?: string;
    processing_completed_at?: string;
    error_message?: string;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/jobs/${jobId}/status`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get processing status');
      }

      return data;
    } catch (error) {
      console.error('Get processing status error:', error);
      throw error;
    }
  }

  // Start processing an existing job
  async startProcessing(jobId: string, options?: {
    analysisType?: 'comprehensive' | 'meeting';
    summaryType?: 'executive' | 'detailed' | 'bullet_points';
  }): Promise<ApiResponse<AudioJob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/jobs/${jobId}/process`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(options || {})
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start processing');
      }

      return data;
    } catch (error) {
      console.error('Start processing error:', error);
      throw error;
    }
  }

  // Create a new audio job
  async createJob(jobData: {
    filename: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
  }): Promise<ApiResponse<AudioJob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/jobs`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create audio job');
      }

      return data;
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  }

  // Get user's audio jobs
  async getUserJobs(options?: {
    status?: AudioJobStatus;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<AudioJob[]>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (options?.status) searchParams.append('status', options.status);
      if (options?.limit) searchParams.append('limit', options.limit.toString());
      if (options?.offset) searchParams.append('offset', options.offset.toString());

      const url = `${API_BASE_URL}/audio/jobs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audio jobs');
      }

      return data;
    } catch (error) {
      console.error('Get user jobs error:', error);
      throw error;
    }
  }

  // Get specific job by ID
  async getJobById(jobId: string): Promise<ApiResponse<AudioJob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/jobs/${jobId}`, {
        method: 'GET',
        headers: await this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audio job');
      }

      return data;
    } catch (error) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  }

  // Update job
  async updateJob(jobId: string, updates: Partial<AudioJob>): Promise<ApiResponse<AudioJob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/audio/jobs/${jobId}`, {
        method: 'PATCH',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update audio job');
      }

      return data;
    } catch (error) {
      console.error('Update job error:', error);
      throw error;
    }
  }

  // Poll job status for real-time updates
  async pollJobStatus(jobId: string, onStatusUpdate?: (job: AudioJob) => void): Promise<AudioJob> {
    const pollInterval = 10000; // 2 seconds
    const maxAttempts = 100; // 5 minutes total (150 * 2s = 300s)
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          
          const response = await this.getJobById(jobId);
          const job = response.data;

          if (!job) {
            reject(new Error('Job not found'));
            return;
          }

          if (onStatusUpdate) {
            onStatusUpdate(job);
          }

          // Check if job is in final state
          if (job.status === 'completed' || job.status === 'failed') {
            resolve(job);
            return;
          }

          // Check if we've exceeded max attempts
          if (attempts >= maxAttempts) {
            reject(new Error('Polling timeout: Job did not complete within expected time'));
            return;
          }

          // Continue polling
          setTimeout(poll, pollInterval);

        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }
}

export const audioJobService = new AudioJobService();
