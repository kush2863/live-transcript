<div align="center">

# LiveTranscript Reporter

_Upload audio → Transcribe & Analyze → Generate Structured Conversation Report._

</div>

## 0. Quick Start

```bash
# Backend
cd backend
npm install && npm run dev

# Frontend (in separate terminal)
cd frontend
npm install && npm run dev
```
Visit: http://localhost:3000 (dashboard, jobs, upload) /documentation for in‑app docs.

Environment variables: see [Environment](#9-environment-variables)

---

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
| Transcription | AssemblyAI (speaker diarization) |
| AI Analysis | Google Gemini |
| Storage | Local `uploads/` (swappable) |

### 3.1 Why These Choices
* **Split Frontend / Backend:** Easier to scale CPU/IO heavy transcription & AI steps separately from edge‑optimized UI.
* **Orchestration Service:** Central point for status transitions, retries, and normalization.
* **Denormalized `report_data`:** One read = full report; UI stays stateless & render‑only.
* **LLM Normalization Layer:** Shields UI from prompt/format drift; future model swaps require minimal changes.

## 4. Data Model (Key Fields)
`audio_jobs` core columns: `id, user_id, filename, status, transcript_data, analysis_data, report_data, error_message, processing_started_at, processing_completed_at, created_at, updated_at` plus optional telemetry (duration, confidence, speakers, etc.).

### 4.1 `report_data` Shape
```jsonc
{
	"title": "Conversation Analysis Report",
	"executive_summary": "3–4 sentence narrative...",
	"key_points": ["Point 1", "Point 2"],
	"action_items": [
		{ "task": "Do X", "assignee": "Alice", "priority": "high", "due_date": "2025-10-05" }
	],
	"full_transcript": [ { "speaker": "A", "start": 0, "end": 3200, "text": "Hello", "confidence": 0.93 } ],
	"metadata": { "duration": 187, "speakers_count": 2, "processed_at": "2025-09-30T...Z" }
}
```

### 4.2 Action Item Normalization
LLM may return strings or heterogenous objects; all coerced to:
```ts
interface ActionItem { task: string; assignee?: string | null; priority: 'high' | 'medium' | 'low'; due_date?: string | null; }
```

## 5. Processing Pipeline
1. Upload → row created (`uploaded`).
2. Transcription (AssemblyAI) → `transcribing`.
3. Store transcript → `analyzing`.
4. Gemini analysis + summary.
5. Normalize & assemble `report_data` (title, summaries, key points, action items, transcript segments, metadata).
6. Mark `completed` or `failed` (with `error_message`).

## 6. AI Prompt Strategy
Dual structure prompt (comprehensive + meeting). Post‑process: strip code fences, parse JSON, normalize action items. Fallback logic ensures UI always has arrays (possibly empty) rather than null.

## 7. Frontend Routes
| Route | Description |
|-------|-------------|
| `/dashboard` | Overview stats & recent jobs |
| `/upload` | Upload audio file |
| `/jobs` | List & filter jobs |
| `/jobs/[id]` | Detailed job status & raw JSON previews |
| `/report/[id]` | Final structured report (5 required sections) |
| `/documentation` | In‑app condensed documentation (mirrors this README) |
| `/login` `/register` | Auth flows |

## 8. API (Express)
| Endpoint | Method | Notes |
|----------|--------|-------|
| `/api/audio/jobs` | GET | User jobs list |
| `/api/audio/jobs/:id` | GET | Single job incl. report when ready |
| `/api/audio/upload` | POST | Multipart upload |
| `/api/audio/process/:id` | POST | (Optional trigger) |

Standard response: `{ success, data?, error? }`.

## 9. Environment Variables
Backend:
```
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
ASSEMBLYAI_API_KEY=...
```
Frontend:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 10. Local Development Workflow
* Start backend & frontend (see Quick Start).
* Upload file → observe status progression in `/jobs`.
* Once completed, open `/report/<jobId>`.

## 11. Error Handling & Resilience
Graceful fallbacks: placeholders instead of crashing UI; `failed` state with message for any stage exception.

## 12. Testing Suggestions
| Layer | What |
|-------|------|
| Unit | `formatActionItems`, title generation, transcript normalization |
| Integration | Upload → complete pipeline |
| Edge | Long audio, single speaker, low confidence |

## 13. Troubleshooting Cheatsheet
| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty report fields | Analysis not stored | Check backend logs & API keys |
| 404 on report | Job not completed | Wait / verify status |
| No action items | LLM output unstructured | Reprocess, confirm normalization |
| One speaker only | No diarization | Ensure AssemblyAI speaker labels enabled |

## 14. Future Enhancements
PDF export, webhooks (replace polling), streaming transcript, entity enrichment, multi‑tenant sharing, transcript confidence heat‑map.

## 15. Key Challenges & Resolutions



Challenge :- Integrating Assembly AI and Gemini and orchestrating the whole process as it was my first time doing it.

### Summary
The system delivers a reproducible pipeline: upload → transcription (AssemblyAI) → AI analysis (Gemini) → normalized `report_data` → minimal structured report UI. Architectural decisions prioritize clarity, future scalability (swap polling for events, move storage to cloud), and resilience against AI output variability.

