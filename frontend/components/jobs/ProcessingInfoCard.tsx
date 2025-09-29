"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AudioJob } from '@/lib/types/audio';
import { statusText } from '@/components/jobs/JobStatus';

interface ProcessingInfoCardProps { job: AudioJob; }

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const getProcessingDuration = (job: AudioJob) => {
  if (!job.processing_started_at) return null;
  const start = new Date(job.processing_started_at);
  const end = job.processing_completed_at ? new Date(job.processing_completed_at) : new Date();
  const duration = Math.round((end.getTime() - start.getTime()) / 1000);
  const minutes = Math.floor(duration / 60); const seconds = duration % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export const ProcessingInfoCard: React.FC<ProcessingInfoCardProps> = ({ job }) => (
  <Card>
    <CardHeader>
      <CardTitle>Processing Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <InfoRow label="Status" value={statusText(job.status)} />
      {job.processing_started_at && <InfoRow label="Started" value={formatDate(job.processing_started_at)} />}
      {job.processing_completed_at && <InfoRow label="Completed" value={formatDate(job.processing_completed_at)} />}
      {getProcessingDuration(job) && <InfoRow label="Duration" value={getProcessingDuration(job) || ''} />}
      {job.assembly_ai_job_id && <InfoRow label="AssemblyAI Job" value={job.assembly_ai_job_id} mono />}
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <span className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export default ProcessingInfoCard;