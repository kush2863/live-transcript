'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileAudio, RefreshCw } from 'lucide-react';
import { useAudioJobs } from '../../lib/hooks/useAudioJobs';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import type { AudioJobStatus } from '../../lib/types/audio';
import JobFilters from '../../components/jobs/JobFilters';
import JobListItem from '../../components/jobs/JobListItem';
import { statusIcon, statusText } from '../../components/jobs/JobStatus';

const JobsPage = () => {
  const { jobs, loading, error, fetchJobs } = useAudioJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AudioJobStatus | 'all'>('all');
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  useEffect(() => {
    let filtered = jobs;
    if (searchTerm) {
      filtered = filtered.filter(job => job.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDuration = (job: any) => {
    if (job.processing_started_at && job.processing_completed_at) {
      const start = new Date(job.processing_started_at);
      const end = new Date(job.processing_completed_at);
      const duration = Math.round((end.getTime() - start.getTime()) / 1000);
      return `${duration}s`;
    }
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Audio Jobs</h1>
            <p className="text-muted-foreground">Manage your audio transcription jobs</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => fetchJobs()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/upload">
              <Button>
                <FileAudio className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <JobFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearch={setSearchTerm}
              onStatusChange={setStatusFilter}
            />
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
              <div className="text-sm text-gray-500">{filteredJobs.length} of {jobs.length} jobs</div>
            </div>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading jobs...</span>
              </div>
            )}
            {!loading && error && (
              <div className="flex items-center justify-center py-12 text-red-600">{error}</div>
            )}
            {!loading && !error && filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{jobs.length === 0 ? 'No audio jobs yet' : 'No jobs match your filters'}</h3>
                <p className="text-gray-500 mb-4">{jobs.length === 0 ? 'Upload your first audio file to get started with transcription and analysis.' : 'Try adjusting your search or filter criteria.'}</p>
                {jobs.length === 0 && (
                  <Link href="/upload">
                    <Button>
                      <FileAudio className="h-4 w-4 mr-2" />
                      Upload Audio
                    </Button>
                  </Link>
                )}
              </div>
            )}
            {!loading && !error && filteredJobs.length > 0 && (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobListItem
                    key={job.id}
                    job={job}
                    formatDate={formatDate}
                    formatFileSize={formatFileSize}
                    getDuration={getDuration as any}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default JobsPage;
