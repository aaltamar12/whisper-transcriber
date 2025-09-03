const MAX_CHUNK_BYTES = 24 * 1024 * 1024; // Whisper API limit: 25 MB
export function splitAudioBuffer(buffer: ArrayBuffer): ArrayBuffer[] {
  const chunks: ArrayBuffer[] = [];
  let offset = 0;
  while (offset < buffer.byteLength) {
    const end = Math.min(offset + MAX_CHUNK_BYTES, buffer.byteLength);
    chunks.push(buffer.slice(offset, end));
    offset = end;
  }
  return chunks;
}
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
}
