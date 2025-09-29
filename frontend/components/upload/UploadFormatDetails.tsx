"use client";
import React from 'react';
import { Card } from '@/components/ui/card';

export const UploadFormatDetails: React.FC = () => (
  <Card className="mt-8 p-6">
    <h3 className="font-semibold mb-4">Supported Formats & Limits</h3>
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      <div>
        <h4 className="font-medium mb-2">Audio Formats:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>MP3 (.mp3)</li>
          <li>WAV (.wav)</li>
          <li>M4A (.m4a)</li>
          <li>MP4 Audio (.mp4)</li>
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-2">Limitations:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Maximum file size: 50MB</li>
          <li>Processing time: 2-5 minutes</li>
          <li>Best quality: Clear speech recording</li>
          <li>Multiple speakers supported</li>
        </ul>
      </div>
    </div>
  </Card>
);

export default UploadFormatDetails;