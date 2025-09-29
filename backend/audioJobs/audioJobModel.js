import { supabase, supabaseAdmin, createUserClient } from '../supabase.js';

export class AudioJobModel {
  
  async createJob(jobData, userToken = null) {
    try {
      // Use user-scoped client if token is provided, otherwise use admin client
      const client = userToken ? createUserClient(userToken) : supabaseAdmin;
      
      const { data, error } = await client
        .from('audio_jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating job:', error);
        throw new Error('Failed to create audio job');
      }

      return data;
    } catch (error) {
      console.error('Error creating audio job:', error);
      throw error;
    }
  }

  async getJobById(jobId, userToken = null) {
    try {
      // Use user-scoped client if token is provided, otherwise use admin client
      const client = userToken ? createUserClient(userToken) : supabaseAdmin;
      
      const { data, error } = await client
        .from('audio_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Supabase error getting job:', error);
        throw new Error('Failed to fetch audio job');
      }

      return data;
    } catch (error) {
      console.error('Error getting audio job:', error);
      throw error;
    }
  }

  async getJobsByUser(userId, options = {}, userToken = null) {
    try {
      // Use user-scoped client if token is provided, otherwise use admin client
      const client = userToken ? createUserClient(userToken) : supabaseAdmin;
      
      let query = client
        .from('audio_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error getting user jobs:', error);
        throw new Error('Failed to fetch user audio jobs');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user audio jobs:', error);
      throw error;
    }
  }

  async updateJob(jobId, updates, userToken = null) {
    try {
      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Use user-scoped client if token is provided, otherwise use admin client
      const client = userToken ? createUserClient(userToken) : supabaseAdmin;
      
      console.log(`Updating job ${jobId} with client:`, userToken ? 'user-scoped' : 'admin');
      
      if (!client) {
        throw new Error('Supabase client is not available');
      }

      const { data, error } = await client
        .from('audio_jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating job:', error);
        throw new Error('Failed to update audio job');
      }

      return data;
    } catch (error) {
      console.error('Error updating audio job:', error);
      throw error;
    }
  }

  async deleteJob(jobId) {
    try {
      const { error } = await supabase
        .from('audio_jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('Supabase error deleting job:', error);
        throw new Error('Failed to delete audio job');
      }

      return true;
    } catch (error) {
      console.error('Error deleting audio job:', error);
      throw error;
    }
  }

  async updateJobStatus(jobId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...additionalData,
        updated_at: new Date().toISOString()
      };

      // Add completion timestamp if completed
      if (status === 'completed') {
        updateData.processing_completed_at = new Date().toISOString();
      }

      return await this.updateJob(jobId, updateData);
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }

  async getJobsByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('audio_jobs')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error getting jobs by status:', error);
        throw new Error('Failed to fetch jobs by status');
      }

      return data || [];
    } catch (error) {
      console.error('Error getting jobs by status:', error);
      throw error;
    }
  }
}
