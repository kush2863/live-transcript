# Database Migration Instructions

## Issue
The audio_jobs table is missing several columns that the application expects:
- audio_duration
- confidence_score  
- speaker_count
- language_detected
- transcript_id
- processing_failed_at

## Solution
Run the migration SQL in your Supabase dashboard:

### Steps:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `backend/database/migration.sql`
4. Run the migration

### Alternative: Quick Fix SQL
If you want to run just the missing columns fix, run this SQL:

```sql
-- Add missing columns to audio_jobs table
ALTER TABLE audio_jobs 
ADD COLUMN IF NOT EXISTS audio_duration INTEGER,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS speaker_count INTEGER,
ADD COLUMN IF NOT EXISTS language_detected TEXT,
ADD COLUMN IF NOT EXISTS processing_failed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS transcript_id TEXT;

-- Update the status constraint to include new status values
ALTER TABLE audio_jobs DROP CONSTRAINT IF EXISTS audio_jobs_status_check;
ALTER TABLE audio_jobs ADD CONSTRAINT audio_jobs_status_check 
CHECK (status IN ('uploaded', 'transcribing', 'analyzing', 'completed', 'failed', 'processing'));
```

### After Migration
1. The server should automatically detect the new columns
2. Audio upload and processing should work correctly
3. AssemblyAI transcription will proceed normally

## Current Status
✅ Authentication working correctly
✅ File uploads working  
✅ Database connections working
❌ Missing database columns (this migration fixes it)
❌ AssemblyAI transcription (will work after migration)
