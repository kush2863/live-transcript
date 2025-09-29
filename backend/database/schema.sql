-- Create tables in Supabase
-- filepath: backend/database/schema.sql

-- Jobs table to track processing status
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'transcribing', 'analyzing', 'completed', 'failed')),
  transcript_data JSONB,
  analysis_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table to store final reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  key_points JSONB NOT NULL,
  action_items JSONB NOT NULL,
  full_transcript JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own jobs" ON jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own reports" ON reports FOR ALL USING (auth.uid() IN (SELECT user_id FROM jobs WHERE id = job_id));