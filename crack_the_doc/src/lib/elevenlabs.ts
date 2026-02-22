/**
 * ElevenLabs text-to-speech API client.
 * Uses convert endpoint (full audio) and chunks long text to stay under model limits.
 */

const API_BASE = "https://api.elevenlabs.io/v1";
const MAX_CHARS_PER_REQUEST = 8_000;
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel (premade)
const MODEL_ID = "eleven_multilingual_v2";

function getApiKey(): string | undefined {
  return import.meta.env.VITE_ELEVENLABS_API_KEY;
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(getApiKey());
}

function getVoiceId(): string {
  const id = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
  return typeof id === "string" && id.trim() ? id.trim() : DEFAULT_VOICE_ID;
}

function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= MAX_CHARS_PER_REQUEST) return [trimmed];
  const chunks: string[] = [];
  let start = 0;
  while (start < trimmed.length) {
    let end = Math.min(start + MAX_CHARS_PER_REQUEST, trimmed.length);
    if (end < trimmed.length) {
      const lastBreak = trimmed.lastIndexOf(". ", end);
      if (lastBreak > start) end = lastBreak + 1;
      else {
        const lastSpace = trimmed.lastIndexOf(" ", end);
        if (lastSpace > start) end = lastSpace + 1;
      }
    }
    chunks.push(trimmed.slice(start, end).trim());
    start = end;
  }
  return chunks.filter(Boolean);
}

/**
 * Generate speech for the given text. Returns an array of audio blobs (one per chunk).
 * Empty array if API key is missing or request fails.
 */
export async function generateSpeech(text: string): Promise<Blob[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const chunks = chunkText(text);
  if (chunks.length === 0) return [];

  const voiceId = getVoiceId();
  const blobs: Blob[] = [];

  for (const chunk of chunks) {
    const url = `${API_BASE}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: chunk,
        model_id: MODEL_ID,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs TTS error:", res.status, err);
      throw new Error(res.status === 401 ? "Invalid ElevenLabs API key" : `TTS failed: ${res.status}`);
    }

    const blob = await res.blob();
    blobs.push(blob);
  }

  return blobs;
}
