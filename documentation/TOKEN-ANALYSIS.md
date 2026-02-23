# Token Usage Analysis — Lumen

This document analyzes how tokens are consumed across the platform, where efficiency is lost, and how we can reduce usage for a later token-efficiency pass.

---

## 1. Where tokens are used

### 1.1 Analysis pipeline (on document upload)

When a user uploads a document, three API calls run in parallel:

| Call            | Input tokens (approx.) | Output tokens (approx.) | Purpose        |
|-----------------|------------------------|--------------------------|----------------|
| `getSummary()`  | System prompt (~200) + **full document** | Summary JSON   | Generate summary |
| `getKeyPoints()`| System prompt (~250) + **full document** | Key points JSON| Extract key points |
| `getQuestions()`| System prompt (~200) + **full document** | Questions JSON | Generate Q&A   |

- **Input**: Each call sends a long system-style prompt (instructions + JSON format) and the **entire** `document.textContent`.
- **Output**: Structured JSON (summary, key_points, questions).
- **Model**: `llama-3.3-70b-versatile` for all.

Rough input per call (for a 10k-character doc): ~200–250 (prompt) + ~2.5k (doc) ≈ **2.7k–2.8k input** per call.  
Total for analysis: **~8k+ input** (document sent three times) plus three outputs.

### 1.2 Chat (streaming)

Each user message triggers one streaming completion:

| Call                     | Input tokens (approx.) | Output tokens (approx.) | Purpose     |
|--------------------------|------------------------|--------------------------|-------------|
| `streamChatbotResponse()`| System (~150) + **full document** + **full conversation history** + new user message | Streamed plain text | Answer question |

- **Input**: System prompt (Lumen rules) + one “document” user message containing the **full document** + all prior user/assistant turns + the new user message.
- **Output**: Plain text stream (no JSON).
- **Model**: Same, `llama-3.3-70b-versatile`.

For a 10k-character doc and 5 back-and-forth messages (~200 tokens each):  
~150 (system) + ~2.5k (doc) + ~1k (history) + ~50 (new message) ≈ **3.7k input** per message.  
Each new message adds more history, so input grows over the session.

---

## 2. Efficiency issues

### 2.1 Document sent multiple times

- **Analysis**: The same document is sent **3 times** (summary, key points, questions). No caching or reuse.
- **Chat**: The **full document** is sent again on **every** user message. There is no compression, summarization, or retrieval step.

Impact: For a 20k-character (~5k-token) document, analysis alone uses ~15k+ document input tokens. In chat, every message re-sends those ~5k document tokens.

### 2.2 No reuse of analysis outputs

- Summary, key points, and questions are only used in the UI.
- Chat does **not** receive the summary or key points; it only receives the raw document. So we pay for analysis tokens but don’t use them to shorten chat context.

### 2.3 Conversation history grows unbounded

- Chat sends the **full** conversation history every time.
- Long sessions (many messages) increase input tokens linearly and can approach context limits.

### 2.4 Prompt verbosity

- Analysis prompts include long instructions and repeated “Return as JSON…” wording.
- Some instructions could be shortened or shared (e.g. “Document:” + content) without losing behavior.

### 2.5 Single model for all tasks

- One model (`llama-3.3-70b-versatile`) is used for both heavy analysis and chat.
- Lighter or cheaper models could be considered for some tasks (e.g. summary vs. chat) to reduce cost/latency if the API supports it.

---

## 3. Rough token math (per document load)

Assume:

- Document: 10,000 characters ≈ **2,500 tokens**.
- Analysis prompts: ~200–250 tokens each × 3 ≈ **700 tokens**.
- Analysis outputs: ~500 (summary) + ~400 (key points) + ~400 (questions) ≈ **1,300 output tokens**.

Then:

- **Analysis total**: ~3 × (250 + 2500) ≈ **8,250 input** + **1,300 output**.
- **First chat message**: ~150 (system) + 2500 (doc) + 50 (user) ≈ **2,700 input** + output.

So one load + one question is on the order of **~11k input** and **~1.3k+ output**. Document tokens dominate.

---

## 4. Recommendations for future token efficiency

### 4.1 Use summary (or summary + key points) in chat instead of full document

- **Idea**: After analysis, chat could receive “Summary (and optionally key points) + full document only when needed.”
- **Default**: Send summary + key points as context (~1k tokens instead of 2.5k+ for a 10k-char doc). Keep “Answer from this context; if you need more detail, say so” and only inject full document for follow-up when the model or user asks.
- **Effect**: Large reduction in chat input tokens per message (e.g. 2–3x for typical docs).

### 4.2 Cache or reuse document context for analysis

- **Idea**: One call that returns summary + key points + questions in a single JSON (multi-task), or two calls (e.g. summary first, then key points + questions conditioned on summary).
- **Effect**: Document sent once or twice instead of three times at load.

### 4.3 Cap or summarize conversation history in chat

- **Idea**: Keep only the last N turns (e.g. 6–10), or periodically replace older turns with a short “Summary of earlier conversation: …” and keep only recent messages.
- **Effect**: Bounded input size for long sessions and fewer “context limit” issues.

### 4.4 Shorten analysis prompts

- **Idea**: Trim instructions to the minimum needed for quality; use a single “Document:” + content pattern; avoid repeating JSON rules in every prompt.
- **Effect**: Fewer input tokens per analysis call (e.g. 10–20% reduction).

### 4.5 Optional: lighter model for analysis

- **Idea**: Use a smaller/faster model for summary/key points/questions if quality is acceptable and the API allows.
- **Effect**: Lower cost and possibly faster analysis; chat can stay on the current model for quality.

### 4.6 Optional: chunked or retrieval-based document use in chat

- **Idea**: For very long documents, don’t send the full text every time. Use embeddings + retrieval to send only relevant chunks, or a short “summary of relevant sections” for the current question.
- **Effect**: Big savings for long docs; requires embedding/retrieval implementation.

---

## 5. Summary table

| Area              | Current behavior              | Main inefficiency           | Priority fix idea                    |
|-------------------|-------------------------------|-----------------------------|--------------------------------------|
| Analysis on load  | 3 calls, each with full doc   | Document sent 3×            | Single multi-task call or 2 calls    |
| Chat context      | Full document every message  | Doc re-sent every turn      | Use summary (+ key points) in chat  |
| Chat history      | Full history every message    | Unbounded growth            | Cap turns or summarize old turns    |
| Prompts           | Long, repetitive              | Extra tokens per call       | Shorten and deduplicate instructions|
| Model choice      | One model for all             | Possibly overkill for some  | Consider smaller model for analysis |

---

## 6. Next steps

- **Short term**: Implement “chat uses summary (+ key points) by default” and cap or summarize conversation history.
- **Medium term**: Consolidate analysis into fewer calls (multi-task or two-step) and shorten prompts.
- **Long term**: For very long documents, consider retrieval or chunked context for chat.

This document should be updated after any token-related change (e.g. new prompts, new API usage, or context strategy) so the analysis stays accurate for future optimization work.
