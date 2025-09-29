'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AudioUpload from '@/components/AudioUpload';
import ProtectedRoute from '@/components/ProtectedRoute';
import UploadHeader from '@/components/upload/UploadHeader';
import UploadSuccessCard from '@/components/upload/UploadSuccessCard';
import UploadSteps from '@/components/upload/UploadSteps';
import UploadFormatDetails from '@/components/upload/UploadFormatDetails';
import type { AudioJob } from '@/lib/types/audio';

export default function UploadPage() {
  const router = useRouter();
  const [uploadedJob, setUploadedJob] = useState<AudioJob | null>(null);

  const handleUploadSuccess = (job: AudioJob) => {
    setUploadedJob(job);
    // Redirect to job status page after a short delay
    setTimeout(() => {
      router.push(`/jobs/${job.id}`);
    }, 2000);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
   
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <UploadHeader />

          {/* Upload Component */}
          {!uploadedJob ? (
            <AudioUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
          ) : (
            <UploadSuccessCard job={uploadedJob} />
          )}

          <UploadSteps />
          <UploadFormatDetails />
        </div>
      </div>
    </ProtectedRoute>
  );
}
