import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Target, User, Calendar } from 'lucide-react';
import type { AudioJob, ActionItem } from '../../lib/types/audio';

interface ReportActionItemsProps { job: AudioJob; }

const normalize = (items: any[]): ActionItem[] => {
  return (items || []).map((item, i) => (
    typeof item === 'string'
      ? { task: item, priority: 'medium' }
      : {
          task: item.task || item.action || `Action ${i + 1}`,
          assignee: item.assignee || item.assigned_to || null,
          priority: (item.priority as any) || 'medium',
          due_date: item.due_date || item.deadline || null
        }
  ));
};

export const ReportActionItems: React.FC<ReportActionItemsProps> = ({ job }) => {
  const raw = job.report_data?.action_items || job.analysis_data?.action_items || [];
  const items = normalize(raw);
  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <Target className="h-5 w-5 mr-2 text-gray-600" /> Action Items & Next Steps
        </CardTitle>
        <CardDescription className="text-gray-600">Tasks and responsibilities identified from the conversation</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <span className="bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    {item.task}
                  </h4>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                    {item.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {item.assignee && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" /> Assigned to: <strong className="ml-1">{item.assignee}</strong>
                    </div>
                  )}
                  {item.due_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Due: {item.due_date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 italic">Action items will be generated after AI analysis is complete.</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportActionItems;
