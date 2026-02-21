import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GROQ_API_KEY is not defined. Please set it in your .env file.");
}

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true,
});

const CHAT_MODEL = "openai/gpt-oss-120b";

// --- Token efficiency: max chars for full document in chat (avoids huge context; future: retrieval-based chunks) ---
const MAX_CHAT_DOCUMENT_CHARS = 12_000;

// --- DocWiz system prompt (short; study assistant) ---
const DOCWIZ_SYSTEM_PROMPT = `You are DocWiz, a study assistant for the document the user is studying.
Be clear, helpful, and concise. Answer only from the provided context. If off-topic, say you can only help with this document.
Reply in plain text; use bullets or code blocks when helpful. Do not output JSON.`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Chat context: summary + key points by default; full document only when user requests (saves tokens). When doc > 12k, RAG can supply retrievedChunks. */
export type DocumentContext = {
  summary: string;
  keyPoints: Array<{ point: string; definition: string }>;
  fullDocument?: string;
  useFullDocument?: boolean;
  /** When set, used as context instead of full doc (RAG for long documents). */
  retrievedChunks?: string;
};

function formatKeyPoints(keyPoints: Array<{ point: string; definition: string }>): string {
  return keyPoints
    .map((kp) => `• ${kp.point}: ${kp.definition}`)
    .join("\n");
}

function buildChatContextContent(ctx: DocumentContext): string {
  if (ctx.useFullDocument && ctx.retrievedChunks) {
    return `Relevant excerpts from the document (use these to answer):\n\n${ctx.retrievedChunks}`;
  }
  if (ctx.useFullDocument && ctx.fullDocument && ctx.fullDocument.length > 0) {
    const truncated =
      ctx.fullDocument.length > MAX_CHAT_DOCUMENT_CHARS
        ? ctx.fullDocument.slice(0, MAX_CHAT_DOCUMENT_CHARS) +
          "\n\n[Document truncated for length. Answer from the portion above.]"
        : ctx.fullDocument;
    return `Document (full):\n\n${truncated}`;
  }
  const keyPointsText = formatKeyPoints(ctx.keyPoints);
  const parts = [ctx.summary];
  if (keyPointsText) parts.push("Key points:\n" + keyPointsText);
  return `Summary and key points. Answer from this context. If you need more detail, say so and the user can enable full document.\n\n${parts.join("\n\n")}`;
}

function buildChatMessages(
  context: DocumentContext,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
): ChatMessage[] {
  const contextContent = buildChatContextContent(context);
  const documentMessage: ChatMessage = {
    role: "user",
    content: `Context for the user's document. Use it to answer. Do not repeat it.\n\n---\n\n${contextContent}`,
  };
  return [
    { role: "system", content: DOCWIZ_SYSTEM_PROMPT },
    documentMessage,
    ...conversationHistory,
    { role: "user", content: newUserMessage },
  ];
}

/** Single-call analysis: summary + key points + questions (document sent once; ~3x fewer tokens than 3 calls). */
const ANALYSIS_PROMPT = `From the document below, produce a single JSON object with three keys: "summary", "key_points", "questions".
1. summary: string — concise summary (20–25% of doc length, clear paragraphs).
2. key_points: array of { "point": "headline", "definition": "explanation" }.
3. questions: array of { "question": "...", "answer": "..." }.
Return valid JSON only (no other text).

Document:

`;

export type AnalysisResult = {
  summary: string;
  key_points: Array<{ point: string; definition: string }>;
  questions: Array<{ question: string; answer: string }>;
};

export async function getAnalysis(content: string): Promise<AnalysisResult> {
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: ANALYSIS_PROMPT + content }],
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
  });
  const raw = response.choices[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { summary: "", key_points: [], questions: [] };
  }
  const summary = typeof parsed.summary === "string" ? parsed.summary : "";
  const key_points = Array.isArray(parsed.key_points)
    ? (parsed.key_points as Array<{ point?: string; definition?: string }>)
        .filter((kp) => kp && (kp.point != null || kp.definition != null))
        .map((kp) => ({
          point: String(kp.point ?? ""),
          definition: String(kp.definition ?? ""),
        }))
    : [];
  const questions = Array.isArray(parsed.questions)
    ? (parsed.questions as Array<{ question?: string; answer?: string }>)
        .filter((q) => q && (q.question != null || q.answer != null))
        .map((q) => ({
          question: String(q.question ?? ""),
          answer: String(q.answer ?? ""),
        }))
    : [];
  return { summary, key_points, questions };
}

/** Non-streaming chat (fallback). Uses summary + key points by default; full document only when requested. */
export const getChatbotResponse = (
  context: DocumentContext,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
) => {
  const messages = buildChatMessages(context, conversationHistory, newUserMessage);
  return groq.chat.completions.create({
    messages,
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
  });
};

/** Streaming chat: yields content deltas. Context = summary + key points unless useFullDocument is true. */
export async function* streamChatbotResponse(
  context: DocumentContext,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
): AsyncGenerator<string, void, unknown> {
  const messages = buildChatMessages(context, conversationHistory, newUserMessage);
  const stream = await groq.chat.completions.create({
    messages,
    model: CHAT_MODEL,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) {
      yield content;
    }
  }
}

const TEACH_ME_BACK_PROMPT = `You are a study coach. The user is explaining a concept from their document in their own words (Teach Me Back / Feynman technique).
Given the document summary and key points below, give brief, gentle feedback in plain text:
1. What they got right.
2. Any important ideas they missed.
3. Any misconceptions to correct.
Keep it encouraging and concise. Do not output JSON.`;

/** Teach Me Back: feedback on user's explanation (missing ideas, misconceptions). Streams plain text. */
export async function* streamTeachMeBackFeedback(
  summary: string,
  keyPoints: Array<{ point: string; definition: string }>,
  userExplanation: string
): AsyncGenerator<string, void, unknown> {
  const keyPointsText = formatKeyPoints(keyPoints);
  const context = `Summary:\n${summary}\n\nKey points:\n${keyPointsText}`;
  const userMessage = `User's explanation:\n\n${userExplanation}`;
  const stream = await groq.chat.completions.create({
    messages: [
      { role: "system", content: TEACH_ME_BACK_PROMPT },
      { role: "user", content: context + "\n\n" + userMessage },
    ],
    model: CHAT_MODEL,
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) yield content;
  }
}

const EXPLAIN_CHILD_PROMPT = `Explain the following concept so a smart 10-year-old can understand it. Use simple words, a short analogy if helpful, and 2–4 sentences. Be friendly. Do not output JSON.`;

/** Explain to a 10-year-old: simple-language explanation of a concept. Streams plain text. */
export async function* streamExplainToChild(concept: string): AsyncGenerator<string, void, unknown> {
  const stream = await groq.chat.completions.create({
    messages: [
      { role: "system", content: EXPLAIN_CHILD_PROMPT },
      { role: "user", content: concept },
    ],
    model: CHAT_MODEL,
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) yield content;
  }
}
