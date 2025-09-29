"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';
import type { AudioJob } from '@/lib/types/audio';

interface JobHeaderProps {
  job: AudioJob;
  onRefresh: () => void;
  refreshing: boolean;
}

export const JobHeader: React.FC<JobHeaderProps> = ({ job, onRefresh, refreshing }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Link href="/jobs">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{job.filename}</h1>
        <p className="text-muted-foreground">Job ID: {job.id}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      {job.status === 'completed' && (
        <Link href={`/report/${job.id}`}>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </Link>
      )}
    </div>
  </div>
);

export default JobHeader;