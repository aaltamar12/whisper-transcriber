import OpenAI, { toFile } from "openai";
import { splitAudioBuffer } from "../utils/audioChunker";
const client = new OpenAI();
export interface TranscriptSegment { text: string; chunkIndex: number }
export async function transcribeFile(buffer: ArrayBuffer, filename: string, language?: string): Promise<string> {
  const chunks = splitAudioBuffer(buffer);
  const segments: TranscriptSegment[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const file = await toFile(new Blob([chunks[i]]), filename, { type: "audio/mpeg" });
    const result = await client.audio.transcriptions.create({
      model: "whisper-1",
      file,
      ...(language ? { language } : {}),
      response_format: "text",
    });
    segments.push({ text: result as unknown as string, chunkIndex: i });
  }
  return segments.map(s => s.text).join(" ").trim();
}
