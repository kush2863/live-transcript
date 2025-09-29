"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileAudio, ExternalLink, Play, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { AudioJob } from '@/lib/types/audio';
import { statusIcon, statusText } from '@/components/jobs/JobStatus';

interface RecentJobsProps {
  jobs: AudioJob[];
  loading: boolean;
  error: string | null;
  limit?: number;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const RecentJobs: React.FC<RecentJobsProps> = ({ jobs, loading, error, limit = 5 }) => {
  const recentJobs = jobs.slice(0, limit);
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Audio Jobs</CardTitle>
            <CardDescription>Your latest audio transcription jobs</CardDescription>
          </div>
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading jobs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audio jobs yet</h3>
            <p className="text-gray-500 mb-4">Upload your first audio file to get started with transcription and analysis.</p>
            <Link href="/upload">
              <Button>
                <FileAudio className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">{statusIcon(job.status, 'h-4 w-4')}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{job.filename}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{statusText(job.status)}</span>
                      <span>•</span>
                      <span>{formatDate(job.created_at)}</span>
                      {job.file_size && (
                        <>
                          <span>•</span>
                          <span>{Math.round(job.file_size / 1024 / 1024 * 100) / 100} MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {job.status === 'completed' && (
                    <Link href={`/report/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                    </Link>
                  )}
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="ghost" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentJobs;