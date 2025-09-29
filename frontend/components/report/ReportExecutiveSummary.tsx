import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { TrendingUp } from 'lucide-react';
import type { AudioJob } from '../../lib/types/audio';

interface ReportExecutiveSummaryProps { job: AudioJob; }

export const ReportExecutiveSummary: React.FC<ReportExecutiveSummaryProps> = ({ job }) => (
  <Card className="mb-6 border border-gray-200">
    <CardHeader>
      <CardTitle className="flex items-center text-xl text-gray-900">
        <TrendingUp className="h-6 w-6 mr-3 text-gray-600" /> Executive Summary
      </CardTitle>
      <CardDescription className="text-gray-600">
        Key insights and outcomes from the conversation
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        {job.report_data?.executive_summary ? (
          <p className="text-gray-800 text-lg leading-relaxed">{job.report_data.executive_summary}</p>
        ) : (
          <p className="text-gray-500 text-lg leading-relaxed italic">Executive summary will be generated after AI analysis is complete.</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ReportExecutiveSummary;
