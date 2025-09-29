"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AudioJob } from '@/lib/types/audio';

interface JobInfoCardProps { job: AudioJob; }

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
});

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes === 0) return '0 Bytes';
  const k = 1024; const sizes = ['Bytes','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const JobInfoCard: React.FC<JobInfoCardProps> = ({ job }) => (
  <Card>
    <CardHeader>
      <CardTitle>File Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <InfoRow label="Filename" value={job.filename} />
      {job.file_size && <InfoRow label="File Size" value={formatFileSize(job.file_size) || ''} />}
      {job.mime_type && <InfoRow label="File Type" value={job.mime_type} />}
      <InfoRow label="Uploaded" value={formatDate(job.created_at)} />
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between"><span className="text-sm font-medium text-gray-500">{label}:</span><span className="text-sm text-gray-900">{value}</span></div>
);

export default JobInfoCard;