'use client';

import React from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useParams } from 'next/navigation';
import useJobPolling from '@/lib/hooks/useJobPolling';
import JobHeader from '@/components/jobs/JobHeader';
import JobStatusCard from '@/components/jobs/JobStatusCard';
import JobInfoCard from '@/components/jobs/JobInfoCard';
import ProcessingInfoCard from '@/components/jobs/ProcessingInfoCard';
import JsonPreviewCard from '@/components/jobs/JsonPreviewCard';

const JobDetailsPage = () => {
  const params = useParams();
  const jobId = params.id as string;
  const { job, loading, error, polling, refresh } = useJobPolling(jobId);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading job details...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !job) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12 text-red-600">
            {error || 'Job not found'}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
  <div className="container mx-auto p-6 space-y-6">
        <JobHeader job={job} onRefresh={refresh} refreshing={loading} />
        <JobStatusCard job={job} polling={polling} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobInfoCard job={job} />
          <ProcessingInfoCard job={job} />
        </div>
        {job.transcript_data && (
          <JsonPreviewCard title="Transcript Preview" description="Generated transcript with speaker identification" data={job.transcript_data} />
        )}
        {job.analysis_data && (
          <JsonPreviewCard title="Analysis Results" description="AI-generated analysis and insights" data={job.analysis_data} />
        )}
        {job.report_data && (
          <JsonPreviewCard
            title="Final Report"
            description="Professional conversation report"
            data={job.report_data}
            actionSlot={<a href={`/report/${job.id}`} className="text-sm underline">Open Report</a>}
          />
        )}
  </div>
    </ProtectedRoute>
  );
};

export default JobDetailsPage;
