import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import type { AudioJob } from '../../lib/types/audio';
import { statusIcon, StatusBadge, statusText } from './JobStatus';

interface JobListItemProps {
  job: AudioJob;
  formatDate: (d: string) => string;
  formatFileSize: (b: number) => string;
  getDuration?: (job: AudioJob) => string | null;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, formatDate, formatFileSize, getDuration }) => {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {statusIcon(job.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">{job.filename}</h3>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Created: {formatDate(job.created_at)}</span>
              {job.file_size && (<><span>•</span><span>{formatFileSize(job.file_size)}</span></>)}
              {job.mime_type && (<><span>•</span><span>{job.mime_type}</span></>)}
              {getDuration && getDuration(job) && (<><span>•</span><span>Duration: {getDuration(job)}</span></>)}
            </div>
            {job.processing_started_at && (
              <div className="text-xs text-gray-500 mt-1">Processing started: {formatDate(job.processing_started_at)}</div>
            )}
            {job.error_message && (
              <div className="text-xs text-red-600 mt-1">Error: {job.error_message}</div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
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
    </div>
  );
};

export default JobListItem;
