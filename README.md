# whisper-transcriber

AI capability: **Audio transcription with word-level timestamps** using OpenAI Whisper API.
Records audio in the browser via MediaRecorder, chunks large files automatically, and summarizes transcripts with GPT-4o including action item extraction.

## Models used
- `whisper-1` — speech-to-text transcription
- `gpt-4o` — transcript summarization and action item extraction

## How to run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click Record.

## Environment variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `WHISPER_LANGUAGE` | ISO 639-1 language hint (e.g. `en`, `es`) |
| `WHISPER_TEMPERATURE` | Sampling temperature (default: `0`) |
| `ENABLE_SUMMARIZATION` | Enable GPT-4o summary (default: `true`) |
