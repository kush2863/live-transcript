import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, MessageSquare } from 'lucide-react';
import type { AudioJob } from '../../lib/types/audio';

interface ReportKeyPointsProps { job: AudioJob; }

export const ReportKeyPoints: React.FC<ReportKeyPointsProps> = ({ job }) => {
  const keyPoints = job.report_data?.key_points || job.analysis_data?.key_points || [];
  const hasKeyPoints = keyPoints.length > 0;
  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <BarChart3 className="h-5 w-5 mr-2 text-gray-600" /> Key Discussion Points
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {hasKeyPoints ? (
          <div className="space-y-3">
            {keyPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-700 flex-1">{point}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Key discussion points will be generated after AI analysis is complete.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportKeyPoints;
