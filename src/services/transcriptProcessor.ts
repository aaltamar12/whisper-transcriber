interface WordTimestamp { word: string; start: number; end: number }

export function formatTranscriptWithTimestamps(words: WordTimestamp[]): string {
  let result = "";
  let lineStart = 0;
  words.forEach((w, i) => {
    if (i === 0 || w.start - words[i - 1].end > 1.5) {
      result += `\n[${formatTime(w.start)}] `;
      lineStart = w.start;
    }
    result += w.word + " ";
  });
  return result.trim();
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function generateSummary(transcript: string, openaiKey: string): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: openaiKey });
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Summarize the transcript in 3-5 bullet points. Identify action items if any." },
      { role: "user", content: transcript },
    ],
    max_tokens: 300,
  });
  return res.choices[0].message.content ?? "";
}
