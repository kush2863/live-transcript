"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { AudioJob } from '@/lib/types/audio';
import { statusIcon, statusText, statusBadgeColor } from '@/components/jobs/JobStatus';

interface JobStatusCardProps {
  job: AudioJob;
  polling: boolean;
}

export const JobStatusCard: React.FC<JobStatusCardProps> = ({ job, polling }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {statusIcon(job.status, 'h-6 w-6')}
          <div>
            <CardTitle className="text-lg">Status</CardTitle>
            <CardDescription>Current processing status</CardDescription>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor(job.status)}`}>
          {statusText(job.status)}
          {polling && <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-current"></div>}
        </span>
      </div>
    </CardHeader>
    {job.error_message && (
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
              <div className="mt-2 text-sm text-red-700">{job.error_message}</div>
            </div>
          </div>
        </div>
      </CardContent>
    )}
  </Card>
);

export default JobStatusCard;