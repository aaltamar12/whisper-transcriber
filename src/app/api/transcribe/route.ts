import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  const language = formData.get("language") as string | undefined;
  const prompt = formData.get("prompt") as string | undefined;

  if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

  const buffer = Buffer.from(await audio.arrayBuffer());
  const file = await toFile(buffer, "audio.webm", { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: language ?? undefined,
    prompt: prompt ?? undefined,
    response_format: "verbose_json",
    timestamp_granularities: ["word", "segment"],
  });

  return NextResponse.json({
    text: transcription.text,
    language: transcription.language,
    duration: transcription.duration,
    words: transcription.words,
    segments: transcription.segments,
  });
}
