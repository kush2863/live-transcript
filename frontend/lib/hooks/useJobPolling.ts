"use client";
import { useEffect, useRef, useState } from 'react';
import type { AudioJob } from '@/lib/types/audio';
import { audioJobService } from '@/lib/services/audioJob';

export const useJobPolling = (jobId: string | null) => {
  const [job, setJob] = useState<AudioJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef(false);

  const fetchJob = async () => {
    if (!jobId) return;
    try {
      setLoading(true); setError(null);
      const response = await audioJobService.getJobById(jobId);
      if (response.success && response.data) setJob(response.data); else setError(response.error || 'Failed to fetch job');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job');
    } finally { setLoading(false); }
  };

  const startPolling = async () => {
    if (!job || ['completed','failed'].includes(job.status) || pollingRef.current) return;
    pollingRef.current = true; setPolling(true);
    try { await audioJobService.pollJobStatus(job.id, updated => setJob(updated)); } finally { setPolling(false); pollingRef.current = false; }
  };

  useEffect(() => { fetchJob(); }, [jobId]);
  useEffect(() => { if (job && ['transcribing','analyzing'].includes(job.status)) startPolling(); }, [job?.status]);

  return { job, loading, error, polling, refresh: fetchJob };
};

export default useJobPolling;