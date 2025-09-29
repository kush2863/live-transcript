"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { AudioJob } from '@/lib/types/audio';

interface UploadSuccessCardProps {
  job: AudioJob;
}

export const UploadSuccessCard: React.FC<UploadSuccessCardProps> = ({ job }) => (
  <Card className="p-8 text-center max-w-2xl mx-auto">
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="p-3 bg-green-100 rounded-full">
          <FileAudio className="h-8 w-8 text-green-600" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Upload Successful!</h2>
        <p className="text-gray-600 mb-4">Your file <strong>{job.filename}</strong> has been uploaded successfully.</p>
        <p className="text-sm text-gray-500">Redirecting to processing status...</p>
      </div>
      <div className="flex justify-center space-x-4">
        <Button asChild>
          <Link href={`/jobs/${job.id}`}>View Processing Status</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/jobs">View All Jobs</Link>
        </Button>
      </div>
    </div>
  </Card>
);

export default UploadSuccessCard;