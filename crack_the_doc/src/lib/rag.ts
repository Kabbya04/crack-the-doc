/**
 * RAG for long documents (> 12k chars). When "Include full document" is on and doc is long,
 * we chunk, embed, and retrieve relevant chunks per query instead of sending the full doc.
 * Requires VITE_OPENAI_API_KEY for embeddings.
 */

const OPENAI_EMBED_API = "https://api.openai.com/v1/embeddings";
const EMBED_MODEL = "text-embedding-3-small";
const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 100;
const TOP_K = 5;

function getApiKey(): string | undefined {
  return import.meta.env.VITE_OPENAI_API_KEY;
}

export function isRagAvailable(): boolean {
  return Boolean(getApiKey());
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + CHUNK_SIZE, text.length);
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }
    chunks.push(text.slice(start, end).trim());
    start = end - (end - start > CHUNK_OVERLAP ? CHUNK_OVERLAP : 0);
    if (start >= text.length) break;
  }
  return chunks.filter(Boolean);
}

async function embed(texts: string[]): Promise<number[][]> {
  const key = getApiKey();
  if (!key) throw new Error("VITE_OPENAI_API_KEY is required for RAG.");
  const response = await fetch(OPENAI_EMBED_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Embedding API error: ${response.status} ${err}`);
  }
  const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
  return data.data.map((d) => d.embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

const cache = new Map<string, { chunks: string[]; embeddings: number[][] }>();

function cacheKey(doc: string): string {
  return `${doc.length}:${doc.slice(0, 200)}`;
}

function getCached(doc: string): { chunks: string[]; embeddings: number[][] } | undefined {
  return cache.get(cacheKey(doc));
}

function setCached(doc: string, chunks: string[], embeddings: number[][]): void {
  cache.set(cacheKey(doc), { chunks, embeddings });
}

/**
 * For documents longer than MAX_CHAR, returns relevant chunk text for the query using embeddings.
 * Caches document chunks and embeddings. Requires VITE_OPENAI_API_KEY.
 */
export async function getRelevantChunks(
  fullDocument: string,
  query: string,
  maxChars: number = 12_000
): Promise<string> {
  if (fullDocument.length <= maxChars) return fullDocument;
  const key = getApiKey();
  if (!key) {
    return fullDocument.slice(0, maxChars) + "\n\n[Document truncated. Set VITE_OPENAI_API_KEY for RAG.]";
  }
  let chunks: string[];
  let embeddings: number[][];
  const cached = getCached(fullDocument);
  if (cached) {
    chunks = cached.chunks;
    embeddings = cached.embeddings;
  } else {
    chunks = chunkText(fullDocument);
    embeddings = await embed(chunks);
    setCached(fullDocument, chunks, embeddings);
  }
  const [queryEmb] = await embed([query]);
  const scored = chunks
    .map((c, i) => ({ chunk: c, sim: cosineSimilarity(embeddings[i], queryEmb) }))
    .sort((a, b) => b.sim - a.sim);
  const selected: string[] = [];
  let totalLen = 0;
  const maxLen = 6000;
  for (const { chunk } of scored.slice(0, TOP_K)) {
    if (totalLen + chunk.length > maxLen) break;
    selected.push(chunk);
    totalLen += chunk.length;
  }
  return selected.join("\n\n---\n\n") || chunks[0] || "";
}
