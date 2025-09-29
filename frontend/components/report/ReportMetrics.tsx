import React from 'react';
import { Clock, Users, BarChart3, Mic } from 'lucide-react';
import MetricTile from '../ui/MetricTile';
import type { AudioJob } from '../../lib/types/audio';

interface ReportMetricsProps {
  job: AudioJob;
  formatDuration: (s: number) => string;
}

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ job, formatDuration }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricTile
        icon={<Clock className="h-8 w-8 text-gray-600" />}
        label="Duration"
        value={job.report_data?.metadata?.duration ? formatDuration(job.report_data.metadata.duration) : 'N/A'}
        testId="metric-duration"
      />
      <MetricTile
        icon={<Users className="h-8 w-8 text-gray-600" />}
        label="Speakers"
        value={job.report_data?.metadata?.speakers_count || job.transcript_data?.speakers?.length || 'N/A'}
        testId="metric-speakers"
      />
      <MetricTile
        icon={<BarChart3 className="h-8 w-8 text-gray-600" />}
        label="Confidence"
        value={job.transcript_data?.confidence ? `${Math.round(job.transcript_data.confidence * 100)}%` : 'N/A'}
        testId="metric-confidence"
      />
      {/* <MetricTile
        icon={<Mic className="h-8 w-8 text-gray-600" />}
        label="Sentiment"
        value={job.analysis_data?.sentiment || 'N/A'}
        testId="metric-sentiment"
      /> */}
    </div>
  );
};

export default ReportMetrics;
