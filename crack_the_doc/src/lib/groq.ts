import Groq from "groq-sdk";

const apiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GROQ_API_KEY is not defined. Please set it in your .env file.");
}

const groq = new Groq({
  apiKey,
  dangerouslyAllowBrowser: true,
});

const CHAT_MODEL = "llama-3.3-70b-versatile";

// --- DocWiz system prompt (study assistant; no repeated greeting) ---
const DOCWIZ_SYSTEM_PROMPT = `You are DocWiz, a knowledgeable and encouraging AI study assistant for the document the user is studying.

Rules:
1. **Persona**: Be clear, helpful, and concise. Use a warm but professional tone. Do not introduce yourself again—the user already knows you.
2. **Scope**: Answer only using the provided document and closely related concepts. If the question is off-topic, say: "I can only help with content from this document. Please ask about the material you uploaded."
3. **Format**: Reply in plain text only. Use short paragraphs or bullet points when helpful. Provide code blocks for your answer when relevant. Do not output JSON for your answer.
4. **Behavior**: If the user says hi or thanks, give a brief friendly reply and invite them to ask about the document. Do not repeat a long welcome.`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function buildChatMessages(
  documentContent: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
): ChatMessage[] {
  const documentMessage: ChatMessage = {
    role: "user",
    content: `The following is the document the user is studying. Use it to answer their questions. Do not repeat it.\n\n---\n\n${documentContent}`,
  };
  const messages: ChatMessage[] = [
    { role: "system", content: DOCWIZ_SYSTEM_PROMPT },
    documentMessage,
    ...conversationHistory,
    { role: "user", content: newUserMessage },
  ];
  return messages;
}

const getGroqChatCompletion = (content: string) => {
  return groq.chat.completions.create({
    messages: [{ role: "user", content }],
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
  });
};

export const getSummary = (content: string) => {
  return getGroqChatCompletion(
    `Generate a comprehensive yet concise summary of the provided document that captures all essential information while maintaining clarity and readability.
     Requirements:
     Content Coverage: Include all major sections, key points, and significant details. Maintain logical flow.
     Length: Typically 20-25% of the original document length. Use clear, complete sentences.
     Format: Output as plain text with paragraphs. No meta-commentary.
     Return the output as a JSON object with a single key "summary".

    Document:
    ${content}`
  );
};

export const getKeyPoints = (content: string) => {
  return getGroqChatCompletion(
    `Extract the key points from the following document. For each key point, provide a headline and a detailed definition or explanation.
    Return the output as a JSON object with a single key "key_points", which should be an array of objects. Each object in the array should have two keys: "point" (the headline) and "definition".
    Ensure there are no empty entries.

    Example format:
    { "key_points": [ { "point": "Key Point 1", "definition": "Detailed definition." }, { "point": "Key Point 2", "definition": "Detailed definition." } ] }

    Document:
    ${content}`
  );
};

export const getQuestions = (content: string) => {
  return getGroqChatCompletion(
    `Generate a list of questions and answers based on the following document.
    Return the output as a JSON object with a single key "questions", which should be an array of objects. Each object should have two keys: "question" and "answer".
    Ensure there are no empty entries.

    Example format:
    { "questions": [ { "question": "What is the primary topic?", "answer": "The primary topic is..." } ] }

    Document:
    ${content}`
  );
};

/** Non-streaming chat (fallback). Uses same system + history; returns full response. */
export const getChatbotResponse = (
  documentContent: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
) => {
  const messages = buildChatMessages(documentContent, conversationHistory, newUserMessage);
  return groq.chat.completions.create({
    messages,
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
  });
};

/** Streaming chat: yields content deltas. No JSON response format so we get plain text stream. */
export async function* streamChatbotResponse(
  documentContent: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  newUserMessage: string
): AsyncGenerator<string, void, unknown> {
  const messages = buildChatMessages(documentContent, conversationHistory, newUserMessage);
  const stream = await groq.chat.completions.create({
    messages,
    model: CHAT_MODEL,
    stream: true,
    // No response_format so we get plain text stream
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) {
      yield content;
    }
  }
}
