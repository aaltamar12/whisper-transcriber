/**
 * Speaker diarization hint for Whisper transcripts.
 *
 * Whisper-1 does not natively support diarization. This service uses a
 * heuristic approach: significant silence gaps (>1.5s) between segments
 * are treated as speaker turn boundaries, and an optional GPT-4o pass
 * can label turns based on conversational context.
 */
export interface TranscriptSegment {
  start: number;  // seconds
  end: number;    // seconds
  text: string;
}

export interface DiarizedSegment extends TranscriptSegment {
  speakerId: string;  // "SPEAKER_01", "SPEAKER_02", ...
}

const SILENCE_THRESHOLD_S = 1.5;

export function applyDiarizationHints(
  segments: TranscriptSegment[]
): DiarizedSegment[] {
  let currentSpeakerIdx = 0;
  let lastEnd = 0;
  const speakerCount = 2; // heuristic: assume 2 speakers for podcast/meeting format

  return segments.map((seg, i) => {
    if (i > 0) {
      const gap = seg.start - lastEnd;
      if (gap > SILENCE_THRESHOLD_S) {
        // Toggle speaker on silence gap
        currentSpeakerIdx = (currentSpeakerIdx + 1) % speakerCount;
      }
    }
    lastEnd = seg.end;
    const speakerId = `SPEAKER_${String(currentSpeakerIdx + 1).padStart(2, "0")}`;
    return { ...seg, speakerId };
  });
}

export function formatDiarizedTranscript(segments: DiarizedSegment[]): string {
  let lastSpeaker = "";
  const lines: string[] = [];

  for (const seg of segments) {
    if (seg.speakerId !== lastSpeaker) {
      lines.push(`\n[${seg.speakerId}]`);
      lastSpeaker = seg.speakerId;
    }
    lines.push(seg.text.trim());
  }

  return lines.join(" ").trim();
}
