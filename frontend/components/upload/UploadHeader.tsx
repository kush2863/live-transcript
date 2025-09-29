"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileAudio } from 'lucide-react';

export const UploadHeader: React.FC = () => (
  <div className="mb-8">
    <Link href="/dashboard">
      <Button variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
    </Link>
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-100 rounded-full">
          <FileAudio className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Audio File</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Upload your audio file to generate a professional transcript with speaker identification and analysis.
      </p>
    </div>
  </div>
);

export default UploadHeader;