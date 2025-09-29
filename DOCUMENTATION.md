# LiveTranscript Reporter – Comprehensive Documentation

## 1. Purpose
End‑to‑end system to ingest an audio file, transcribe it with speaker diarization, run AI analysis, and surface a professional structured report containing:
1. Conversation Title
2. Executive Summary
3. Key Discussion Points
4. Action Items & Next Steps
5. Full Diarized Transcript

## 2. High‑Level Architecture
```
Client (Next.js App)
	│
	├── Auth (Supabase Auth)
	│
	├── Upload Audio  ──► Backend (Express API)
	│                         │
	│                         ├── Store raw file (filesystem or Supabase Storage)
	│                         ├── Create audio_jobs row (status=uploaded)
	│                         ├── Orchestration Service
	│                         │     1. Transcribe (AssemblyAI)
	│                         │     2. AI Analysis + Summary (Gemini)
	│                         │     3. Build report_data JSON
	│                         │     4. Update audio_jobs (status=completed)
	│                         │
	│                         └── Persist structured results
	│
	└── Poll / Fetch Job & Report Data ► Render Minimal Report UI
```

## 3. Technology Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js (App Router), TypeScript, Tailwind (utility classes) |
| Auth | Supabase Auth |
| Backend | Node.js + Express |
| DB | Postgres (Supabase) |
| Transcription | AssemblyAI (auto speaker diarization) |
| AI Analysis | Google Gemini (generative model) |
| Storage | Local `uploads/` (can swap to Supabase Storage) |

## 4. Data Model
### 4.1 Table: `audio_jobs`
Core columns (from schema + migrations):
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Generated |
| user_id | UUID | RLS restricted |
| filename | text | Original name |
| file_path | text | Local path or storage pointer |
| file_size | int | Bytes |
| mime_type | text | Audio mime |
| status | text | uploaded | transcribing | analyzing | completed | failed |
| transcript_data | jsonb | Raw transcript payload incl. utterances |
| analysis_data | jsonb | AI (Gemini) raw structured analysis |
| report_data | jsonb | Final normalized report object for UI |
| error_message | text | Failure reason |
| audio_duration | int | Seconds |
| confidence_score | numeric | Transcript confidence (0–1) |
| speaker_count | int | Auto detected |
| language_detected | text | BCP‑47 code |
| transcript_id | text | AssemblyAI transcript id |
| ai_summary | text | (optional legacy) |
| ai_analysis | jsonb | (legacy optional) |
| results | jsonb | (optional aggregate) |
| processing_started_at | timestamptz |  |
| processing_completed_at | timestamptz |  |
| created_at / updated_at | timestamptz |  |

### 4.2 `report_data` Shape
```jsonc
{
	"title": "Conversation Analysis Report",
	"executive_summary": "3–4 sentence narrative...",
	"key_points": ["Point 1", "Point 2", "Point 3"],
	"action_items": [
		{ "task": "Do X", "assignee": "Alice", "priority": "high", "due_date": "2025-10-05" }
	],
	"full_transcript": [
		{ "speaker": "A", "start": 0, "end": 3200, "text": "Hello...", "confidence": 0.93, "segment_id": 1 }
	],
	"metadata": { "duration": 187, "speakers_count": 2, "processed_at": "2025-09-30T...Z" }
}
```

### 4.3 Transcript Segment
```ts
interface TranscriptSegment {
	speaker: string;      // Letter label
	start: number;        // ms
	end: number;          // ms
	text: string;
	confidence: number;   // 0–1
}
```

### 4.4 Action Item Normalization
The AI may return either strings or rich objects. Normalization (`formatActionItems`) guarantees:
```ts
interface ActionItem {
	task: string;
	assignee?: string | null;
	priority: 'high' | 'medium' | 'low';
	due_date?: string | null; // ISO / natural if detected
}
```

## 5. Processing Pipeline (Backend)
File: `backend/services/orchestration.js`
1. Update job → status=transcribing.
2. AssemblyAI transcription (auto speaker_labels). Collect: id, text, utterances, speakers.
3. Persist `transcript_data`; status=analyzing.
4. Gemini analysis (`GeminiService.analyzeTranscript`) → rich JSON with summary, content insights.
5. Gemini executive summary (`generateSummary`).
6. Build `report_data`:
	 - Title via heuristic (`generateReportTitle`).
	 - Executive summary from summary result.
	 - Key points from `summary.key_points` fallback `content_insights.key_decisions`.
	 - Action items via `formatActionItems` (comprehensive + meeting schema compatibility).
	 - Transcript normalized from utterances.
7. Update job → status=completed.

Error path: Any failure sets status=failed + `error_message`.

## 6. AI (Gemini) Prompting
`GeminiService.buildAnalysisPrompt` constructs a JSON‑schema style instruction embedding:
* Raw transcript text
* Duration / confidence
* Derived speaker stats
* Entities / chapters (when present)

Two structural modes:
* `comprehensiveStructure` – broad qualitative + quantitative insight.
* `meetingStructure` – meeting‑centric (action items, decisions, time allocation).

Post‑processing:
* Strips ```json fences
* Parses JSON
* Normalization of action items to objects.

## 7. Frontend Overview (Next.js App Router)
| Route | Purpose |
|-------|---------|
| `/upload` | Upload audio file |
| `/jobs` | List recent jobs |
| `/jobs/[id]` | Job detail / status (polling) |
| `/report/[id]` | Final minimal report view |
| `/dashboard` | Overview / shortcuts |
| `/login`, `/register` | Auth flows |

Key file: `frontend/app/report/[id]/page.tsx` – renders required 5 sections, minimal grayscale aesthetic. Shows placeholder text when `report_data` fields absent.

## 8. API Surface (Express)
Base prefix: `/api`
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | POST/GET | Auth (Supabase session wrappers) |
| `/api/audio/jobs` | GET | List current user jobs |
| `/api/audio/jobs/:id` | GET | Fetch single job (includes `report_data` when ready) |
| `/api/audio/upload` | POST | (Implemented in route file) Accept multipart audio |
| `/api/audio/process/:id` | POST | Trigger processing (if separated) |

Responses follow shape:
```jsonc
{ "success": true, "data": { /* resource */ } }
```
Errors:
```json
{ "success": false, "error": "Message" }
```

## 9. Environment Variables
Backend `.env` (example):
```
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=...            # Project API URL
SUPABASE_ANON_KEY=...       # Public anon key
SUPABASE_SERVICE_ROLE_KEY=... # Service role (secure, server only)
GEMINI_API_KEY=...          # Google Generative AI key
ASSEMBLYAI_API_KEY=...      # AssemblyAI key
```
Frontend `.env.local` (if needed for client):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 10. Local Development
Terminal 1 – Backend:
```
cd backend
npm install
npm run dev   # or: node index.js
```
Terminal 2 – Frontend:
```
cd frontend
npm install
npm run dev
```
Visit: http://localhost:3000

## 11. Upload & Processing Flow (UI)
1. User authenticates.
2. User uploads audio (store + create `audio_jobs`).
3. Poll `/api/audio/jobs/:id` until `status === completed`.
4. Navigate to `/report/:id` – render structured report.

## 12. Error Handling & Resilience
| Stage | Possible Error | Handling |
|-------|----------------|----------|
| Upload | Unsupported mime / size | Reject early (frontend + backend) |
| Transcription | Network / API limit | Mark failed, store `error_message` |
| AI Analysis | Model parse failure | Catch JSON parse, fallback message |
| DB Update | Connection issue | Retry fallback minimal update |

UI shows placeholders when sections absent instead of failing.

## 13. Action Items & Next Steps Logic
Normalization ensures even plain strings become structured objects with default `priority="medium"`.
If Gemini returns meeting schema: adapt `assigned_to` → `assignee`, `deadline` → `due_date`.

## 14. Security Notes
* Service role key never exposed client‑side.
* RLS policies restrict `audio_jobs` per `user_id`.
* Only minimal data returned; no internal keys leaked.

## 15. Migration Guidance
Run SQL manually in Supabase SQL Editor (compiled from migrations):
```sql
ALTER TABLE audio_jobs 
	ADD COLUMN IF NOT EXISTS audio_duration INTEGER,
	ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,4),
	ADD COLUMN IF NOT EXISTS speaker_count INTEGER,
	ADD COLUMN IF NOT EXISTS language_detected TEXT,
	ADD COLUMN IF NOT EXISTS transcript_id TEXT,
	ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
	ADD COLUMN IF NOT EXISTS ai_summary TEXT,
	ADD COLUMN IF NOT EXISTS results JSONB;
CREATE INDEX IF NOT EXISTS idx_audio_jobs_status ON audio_jobs(status);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_created_at ON audio_jobs(created_at);
```

## 16. Testing Recommendations
* Unit: `generateReportTitle`, `formatActionItems`, transcript normalization.
* Integration: End‑to‑end job creation → completed.
* Edge cases: Single speaker, silent audio, long pauses, low confidence.

## 17. Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Report shows placeholders only | AI analysis not stored | Check backend logs, ensure `GEMINI_API_KEY` |
| All transcript in one speaker | Source mono / diarization off | Confirm `speaker_labels: true` in AssemblyAI config |
| Action items empty | Model returned strings | Verify normalization path / reprocess |
| 404 on `/report/:id` | Job not completed | Wait or verify job id / status |

## 18. Future Enhancements
* Webhook instead of polling for AssemblyAI completion.
* PDF / DOCX export of report.
* Real‑time streaming transcript.
* Multi‑tenant org / team sharing.
* Confidence heat‑map highlighting in transcript.
* Entity linking & timeline visualization.

## 19. Summary
The system couples reliable transcription (AssemblyAI) with structured LLM post‑processing (Gemini) to produce an immediately consumable conversation intelligence report. The explicit normalization layer guarantees consistent frontend rendering even with heterogeneous AI outputs.

---


