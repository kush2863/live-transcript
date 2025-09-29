'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { audioJobService } from '../../../lib/services/audioJob';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { AudioJob } from '../../../lib/types/audio';
import ReportHeader from '../../../components/report/ReportHeader';
import ReportMetrics from '../../../components/report/ReportMetrics';
import ReportExecutiveSummary from '../../../components/report/ReportExecutiveSummary';
import ReportKeyPoints from '../../../components/report/ReportKeyPoints';
import ReportActionItems from '../../../components/report/ReportActionItems';
import ReportTranscript from '../../../components/report/ReportTranscript';

const ReportPage = () => {
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<AudioJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await audioJobService.getJobById(jobId);
      
      if (response.success && response.data) {
        setJob(response.data);
      } else {
        setError(response.error || 'Failed to fetch job details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // (Retained for potential future theming logic) Placeholder util removed during refactor.

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading report...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load report</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Link href="/jobs" className="text-blue-600 hover:underline">Return to Jobs</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!job) {
    return null; // Safety (should be covered by loading/error states)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ReportHeader job={job} formatTimestamp={formatTimestamp} />
          <ReportMetrics job={job} formatDuration={formatDuration} />
          <ReportExecutiveSummary job={job} />
          <ReportKeyPoints job={job} />
            {/* <ReportActionItems job={job} /> */}
          <ReportTranscript job={job} formatDuration={formatDuration} />
          {!job.transcript_data && !job.analysis_data && !job.report_data && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">This job completed but no analysis results are available.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ReportPage;
