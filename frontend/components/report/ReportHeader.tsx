import React from 'react';
import { Card, CardContent } from '../ui/card';
import { FileAudio, Calendar, CheckCircle2, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { AudioJob } from '../../lib/types/audio';

interface ReportHeaderProps {
  job: AudioJob;
  formatTimestamp: (ts: string) => string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ job, formatTimestamp }) => {
  return (
    <div className="mb-8">
      <Link href="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
      </Link>
      <Card className="bg-white text-gray-900 border border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                <FileAudio className="h-6 w-6 mr-3 text-gray-600" />
                <span className="text-gray-600 text-sm font-medium">CONVERSATION REPORT</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                {job.report_data?.title || `Analysis Report: ${job.filename}`}
              </h1>
              <p className="text-gray-600 text-lg">Generated from audio file: {job.filename}</p>
              <div className="flex items-center mt-4 space-x-6 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Processed: {formatTimestamp(job.processing_completed_at || job.updated_at)}
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-gray-500" /> Status: Completed
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">
                  {job.transcript_data?.confidence ? `${Math.round(job.transcript_data.confidence * 100)}%` : 'N/A'}
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportHeader;
