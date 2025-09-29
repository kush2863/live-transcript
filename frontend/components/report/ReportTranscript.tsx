import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, Users, Clock, AlertCircle } from 'lucide-react';
import type { AudioJob, TranscriptSegment } from '../../lib/types/audio';

interface ReportTranscriptProps { job: AudioJob; formatDuration: (s: number) => string; }

export const ReportTranscript: React.FC<ReportTranscriptProps> = ({ job, formatDuration }) => {
  const full = job.report_data?.full_transcript;
  const fallback = job.transcript_data?.segments;
  const segments: any[] | undefined = full || fallback;
  const speakerCount = job.transcript_data?.speakers?.length || job.report_data?.metadata?.speakers_count;

  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader className=" border-b border-gray-200">
        <CardTitle className="flex items-center text-xl text-gray-900">
          <MessageSquare className="h-6 w-6 mr-3 text-gray-600" /> Full Diarized Transcript
        </CardTitle>
        <CardDescription className="text-gray-600">
          Complete conversation with speaker identification, timestamps, and confidence scores
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {speakerCount || 'Multiple'} Speakers
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Duration: {job.report_data?.metadata?.duration ? formatDuration(job.report_data.metadata.duration) : 'Unknown'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">Scroll to read full conversation</div>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {segments ? (
              <div className="divide-y divide-gray-100">
                {segments.map((segment: TranscriptSegment & { segment_id?: number }, index: number) => (
                  <div key={index} className="group hover:bg-gray-50 transition-colors duration-200">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-700 font-bold text-sm border border-gray-300">
                            {segment.speaker}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Speaker {segment.speaker}</h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.floor(segment.start / 1000)}s - {Math.floor(segment.end / 1000)}s
                              </span>
                              {segment.confidence && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                                  {Math.round(segment.confidence * 100)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">#{String(index + 1).padStart(3, '0')}</div>
                      </div>
                      <div className="ml-13">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <p className="text-gray-800 leading-relaxed text-base">"{segment.text}"</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Duration: {((segment.end - segment.start) / 1000).toFixed(1)}s</span>
                            <span>Words: {segment.text.split(' ').length}</span>
                          </div>
                          <span className="font-mono">{Math.floor(segment.start / 1000)}s → {Math.floor(segment.end / 1000)}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
                <p className="text-gray-600">The transcript could not be generated for this audio file.</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Total Segments: {segments?.length || 0}</span>
                <span>Average Confidence: {job.transcript_data?.confidence ? `${Math.round(job.transcript_data.confidence * 100)}%` : 'N/A'}</span>
              </div>
       
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTranscript;
