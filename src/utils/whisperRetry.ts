import OpenAI from "openai";
import { toFile } from "openai";

interface TranscribeOptions {
  language?: string;
  temperature?: number;
  maxRetries?: number;
}

export async function transcribeWithRetry(
  client: OpenAI,
  audioBuffer: Buffer,
  filename: string,
  options: TranscribeOptions = {}
): Promise<OpenAI.Audio.Transcription> {
  const { language, temperature = 0, maxRetries = 4 } = options;
  let delay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const file = await toFile(audioBuffer, filename, { type: "audio/webm" });
      return await client.audio.transcriptions.create({
        file,
        model: "whisper-1",
        ...(language ? { language } : {}),
        temperature,
        response_format: "verbose_json",
      });
    } catch (err) {
      const isRetryable =
        err instanceof OpenAI.RateLimitError ||
        err instanceof OpenAI.InternalServerError ||
        err instanceof OpenAI.APIConnectionTimeoutError;

      if (!isRetryable || attempt === maxRetries) throw err;

      console.warn(`[whisper] attempt ${attempt} failed, retrying in ${delay}ms: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }

  throw new Error("Unreachable");
}
