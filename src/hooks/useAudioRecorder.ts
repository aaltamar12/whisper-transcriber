"use client";
import { useState, useRef, useCallback } from "react";

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>({ isRecording: false, isPaused: false, duration: 0, audioBlob: null });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((t) => t.stop());
      setState((s) => ({ ...s, isRecording: false, audioBlob: blob }));
    };

    recorder.start(1000);
    timerRef.current = setInterval(() => setState((s) => ({ ...s, duration: s.duration + 1 })), 1000);
    setState({ isRecording: true, isPaused: false, duration: 0, audioBlob: null });
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const pause = useCallback(() => {
    mediaRecorderRef.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setState((s) => ({ ...s, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    mediaRecorderRef.current?.resume();
    timerRef.current = setInterval(() => setState((s) => ({ ...s, duration: s.duration + 1 })), 1000);
    setState((s) => ({ ...s, isPaused: false }));
  }, []);

  return { state, start, stop, pause, resume };
}
