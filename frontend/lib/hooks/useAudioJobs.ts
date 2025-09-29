'use client';

import { useState, useEffect, useCallback } from 'react';
import { audioJobService } from '../services/audioJob';
import type { AudioJob, AudioJobStatus } from '../types/audio';

export function useAudioJobs() {
  const [jobs, setJobs] = useState<AudioJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (options?: {
    status?: AudioJobStatus;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await audioJobService.getUserJobs(options);
      
      if (response.success && response.data) {
        setJobs(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData: {
    filename: string;
    file_path: string;
    file_size?: number;
    mime_type?: string;
  }) => {
    try {
      setError(null);
      
      const response = await audioJobService.createJob(jobData);
      
      if (response.success && response.data) {
        // Add the new job to the beginning of the list
        setJobs(prevJobs => [response.data!, ...prevJobs]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create job');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      console.error('Create job error:', err);
      throw err;
    }
  }, []);

  const updateJob = useCallback(async (jobId: string, updates: Partial<AudioJob>) => {
    try {
      setError(null);
      
      const response = await audioJobService.updateJob(jobId, updates);
      
      if (response.success && response.data) {
        // Update the job in the list
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? response.data! : job
          )
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update job');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      console.error('Update job error:', err);
      throw err;
    }
  }, []);

  const startProcessing = useCallback(async (jobId: string, options?: {
    analysisType?: 'comprehensive' | 'meeting';
    summaryType?: 'executive' | 'detailed' | 'bullet_points';
  }) => {
    try {
      setError(null);
      
      const response = await audioJobService.startProcessing(jobId, options);
      
      if (response.success && response.data) {
        // Update the job in the list
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? response.data! : job
          )
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to start processing');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start processing';
      setError(errorMessage);
      console.error('Start processing error:', err);
      throw err;
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setError(null);
      
      const response = await audioJobService.uploadAudio(file);
      
      if (response.success && response.data) {
        // Add the job to the list
        setJobs(prevJobs => [response.data!, ...prevJobs]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to upload file');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      console.error('Upload file error:', err);
      throw err;
    }
  }, []);

  const processAudio = useCallback(async (file: File, options?: {
    analysisType?: 'comprehensive' | 'meeting';
    summaryType?: 'executive' | 'detailed' | 'bullet_points';
  }) => {
    try {
      setError(null);
      
      const response = await audioJobService.processAudio(file, options);
      
      if (response.success && response.data) {
        // Add the job to the list
        setJobs(prevJobs => [response.data!, ...prevJobs]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to process audio');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
      setError(errorMessage);
      console.error('Process audio error:', err);
      throw err;
    }
  }, []);

  const pollJobStatus = useCallback(async (
    jobId: string, 
    onStatusUpdate?: (job: AudioJob) => void
  ) => {
    try {
      setError(null);
      
      const job = await audioJobService.pollJobStatus(jobId, (updatedJob: AudioJob) => {
        // Update the job in the list
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === jobId ? updatedJob : j
          )
        );
        
        // Call the provided callback
        if (onStatusUpdate) {
          onStatusUpdate(updatedJob);
        }
      });

      return job;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to poll job status';
      setError(errorMessage);
      console.error('Poll job status error:', err);
      throw err;
    }
  }, []);

  const getJobById = useCallback(async (jobId: string) => {
    try {
      setError(null);
      
      const response = await audioJobService.getJobById(jobId);
      
      if (response.success && response.data) {
        // Update the job in the list if it exists
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? response.data! : job
          )
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to fetch job');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(errorMessage);
      console.error('Get job by ID error:', err);
      throw err;
    }
  }, []);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    startProcessing,
    uploadFile,
    processAudio,
    pollJobStatus,
    getJobById
  };
}
