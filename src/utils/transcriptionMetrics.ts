export interface TranscriptionMetric {
  jobId: string;
  durationSeconds: number;
  chunkCount: number;
  language: string;
  wordCount: number;
  latencyMs: number;
  whisperTokensEstimated: number;
  timestamp: string;
}

const metrics: TranscriptionMetric[] = [];

export function recordTranscription(metric: Omit<TranscriptionMetric, "jobId" | "timestamp">): string {
  const jobId = Math.random().toString(36).slice(2, 10);
  metrics.push({ ...metric, jobId, timestamp: new Date().toISOString() });
  const realTimeFactor =
    metric.durationSeconds > 0
      ? (metric.latencyMs / 1000 / metric.durationSeconds).toFixed(2)
      : "n/a";
  console.info(
    `[whisper] job=${jobId} lang=${metric.language} audio=${metric.durationSeconds}s ` +
      `chunks=${metric.chunkCount} words=${metric.wordCount} ` +
      `latency=${metric.latencyMs}ms RTF=${realTimeFactor}`
  );
  return jobId;
}

export function getAverageRealTimeFactor(): number {
  const valid = metrics.filter((m) => m.durationSeconds > 0);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((s, m) => s + m.latencyMs / 1000 / m.durationSeconds, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}
