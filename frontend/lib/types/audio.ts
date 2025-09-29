// Types for audio processing and reporting

export type AudioJobStatus = 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed';

export interface AudioJob {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: AudioJobStatus;
  assembly_ai_job_id?: string;
  transcript_data?: TranscriptData;
  analysis_data?: AnalysisData;
  report_data?: ReportData;
  error_message?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface TranscriptData {
  segments: TranscriptSegment[];
  speakers: string[];
  confidence: number;
  processing_time: number;
}

export interface ActionItem {
  task: string;
  assignee?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
}

export interface AnalysisData {
  summary: string;
  key_points: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  action_items: ActionItem[];
}

export interface ReportData {
  title: string;
  executive_summary: string;
  key_points: string[];
  action_items: ActionItem[];
  full_transcript: TranscriptSegment[];
  metadata: {
    duration: number;
    speakers_count: number;
    processed_at: string;
  };
}

export interface Report {
  id: string;
  job_id: string;
  title: string;
  executive_summary: string;
  key_points: string[];
  action_items: ActionItem[];
  full_transcript: TranscriptSegment[];
  created_at: string;
}

// File upload types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResponse {
  success: boolean;
  job_id?: string;
  file_path?: string;
  error?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
