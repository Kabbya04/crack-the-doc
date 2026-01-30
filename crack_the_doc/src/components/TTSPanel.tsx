import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, StopCircle, Volume2 } from "lucide-react";

// ~150 words/min ≈ 2.5 chars/word → ~12 chars/sec for average reading
const CHARS_PER_SEC = 12;
const PAUSE_BETWEEN_SENTENCES_MS = 280;

function estimateDurationMs(text: string): number {
  if (!text.trim()) return 0;
  const chars = text.trim().length;
  return (chars / CHARS_PER_SEC) * 1000;
}

function splitIntoChunks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickBestVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  if (en.length === 0) return voices[0] ?? null;
  const preferred = en.find(
    (v) =>
      /google|microsoft|samantha|daniel|karen|alex|natural|premium/i.test(v.name)
  );
  if (preferred) return preferred;
  const defaultEn = en.find((v) => v.default);
  return defaultEn ?? en[0];
}

type Props = { textToRead: string };

const TTSPanel = ({ textToRead }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsedMsRef = useRef(0);
  const totalMsRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextChunkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    if (!synth) return;
    const onVoicesChanged = () => {
      synth.getVoices();
      setVoicesReady(true);
    };
    synth.addEventListener("voiceschanged", onVoicesChanged);
    onVoicesChanged();
    return () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, [synth]);

  const stopProgressTimer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    const start = Date.now() - elapsedMsRef.current;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      elapsedMsRef.current = elapsed;
      const total = totalMsRef.current;
      if (total <= 0) return;
      const p = Math.min(100, (elapsed / total) * 100);
      setProgress(p);
      if (p >= 100) stopProgressTimer();
    }, 100);
  }, [stopProgressTimer]);

  useEffect(() => {
    return () => {
      if (nextChunkTimeoutRef.current) {
        clearTimeout(nextChunkTimeoutRef.current);
        nextChunkTimeoutRef.current = null;
      }
      stopProgressTimer();
      if (synth) synth.cancel();
    };
  }, [synth, stopProgressTimer]);

  const handlePlayPause = () => {
    if (!synth) return;
    if (isPlaying && !isPaused) {
      synth.pause();
      stopProgressTimer();
      setIsPaused(true);
    } else if (isPaused) {
      synth.resume();
      startProgressTimer();
      setIsPaused(false);
    } else {
      const trimmed = textToRead.trim();
      if (!trimmed) return;
      const chunks = splitIntoChunks(trimmed);
      if (chunks.length === 0) return;

      totalMsRef.current =
        estimateDurationMs(trimmed) + (chunks.length - 1) * PAUSE_BETWEEN_SENTENCES_MS;
      elapsedMsRef.current = 0;
      setProgress(0);
      setIsPlaying(true);
      setIsPaused(false);

      const voice = voicesReady ? pickBestVoice(synth) : null;
      const rate = 0.95;
      const pitch = 1;

      let index = 0;
      function speakNext() {
        if (index >= chunks.length) {
          setProgress(100);
          stopProgressTimer();
          setIsPlaying(false);
          setIsPaused(false);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (voice) utterance.voice = voice;
        utterance.lang = "en-US";

        utterance.onstart = () => {
          if (index === 0) startProgressTimer();
        };

        utterance.onend = () => {
          index += 1;
          if (index < chunks.length) {
            nextChunkTimeoutRef.current = setTimeout(
              speakNext,
              PAUSE_BETWEEN_SENTENCES_MS
            );
          } else {
            setProgress(100);
            stopProgressTimer();
            setIsPlaying(false);
            setIsPaused(false);
          }
        };

        utterance.onerror = () => {
          index += 1;
          if (index < chunks.length) {
            nextChunkTimeoutRef.current = setTimeout(speakNext, 100);
          } else {
            setProgress(100);
            stopProgressTimer();
            setIsPlaying(false);
            setIsPaused(false);
          }
        };

        synth.speak(utterance);
      }

      speakNext();
    }
  };

  const handleStop = () => {
    if (nextChunkTimeoutRef.current) {
      clearTimeout(nextChunkTimeoutRef.current);
      nextChunkTimeoutRef.current = null;
    }
    if (synth) {
      synth.cancel();
      stopProgressTimer();
      elapsedMsRef.current = 0;
      totalMsRef.current = 0;
      setProgress(0);
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const btnBase =
    "flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-sage-surface";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-pale-sage/80 px-4 py-3 dark:bg-dark-sage/80">
      <button
        type="button"
        onClick={handlePlayPause}
        className={`${btnBase} bg-soft-clay text-deep-moss hover:bg-soft-clay-hover focus:ring-soft-clay dark:bg-dark-clay dark:text-dark-sage dark:hover:opacity-90 dark:focus:ring-dark-clay`}
        aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
      >
        {isPlaying && !isPaused ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>
      <button
        type="button"
        onClick={handleStop}
        className={`${btnBase} bg-deep-moss/15 text-deep-moss hover:bg-deep-moss/25 focus:ring-deep-moss/30 dark:bg-dark-moss/20 dark:text-dark-moss dark:hover:bg-dark-moss/30 dark:focus:ring-dark-moss/40`}
        aria-label="Stop"
      >
        <StopCircle className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center gap-2">
        <Volume2 className="h-5 w-5 shrink-0 text-deep-moss/50 dark:text-dark-moss/50" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-deep-moss/20 dark:bg-dark-moss/30">
          <div
            className="h-full rounded-full bg-soft-clay dark:bg-dark-clay transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TTSPanel;
