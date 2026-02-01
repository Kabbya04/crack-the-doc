import { useState, useRef, useEffect } from "react";
import { FileText, SendHorizontal } from "lucide-react";
import { streamChatbotResponse } from "../lib/groq";

type Props = {
  fileName: string;
  documentContent: string;
};

type Message = { sender: "ai" | "user"; text: string };

const INITIAL_AI_MESSAGE: Message = {
  sender: "ai",
  text: "Hello! I'm DocWiz, your guide for this document. Ask me anything about the material.",
};

const ChatPanel = ({ fileName, documentContent }: Props) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_AI_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: Message = { sender: "user", text: trimmed };
    setInputValue("");
    setIsChatLoading(true);

    // Conversation history for API: exclude the initial welcome (index 0) and the messages we're about to add
    const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = messages
      .slice(1)
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

    // Add user message and placeholder AI message in one update
    setMessages((prev) => [...prev, userMessage, { sender: "ai", text: "" }]);

    try {
      let fullText = "";
      for await (const chunk of streamChatbotResponse(
        documentContent,
        conversationHistory,
        trimmed
      )) {
        fullText += chunk;
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.sender === "ai") {
            next[next.length - 1] = { ...last, text: fullText };
          }
          return next;
        });
      }
      // If stream ended with empty response, set a fallback
      if (!fullText.trim()) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.sender === "ai") {
            next[next.length - 1] = { ...last, text: "I couldn't generate a response. Please try again." };
          }
          return next;
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        sender: "ai",
        text:
          error instanceof Error && error.message.includes("VITE_GROQ_API_KEY")
            ? "API key is not configured. Please set VITE_GROQ_API_KEY in your .env file."
            : "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => {
        const next = prev.slice(0, -1);
        return [...next, errorMessage];
      });
    }
    setIsChatLoading(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-deep-moss/12 bg-white shadow-soft-md dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
      <div className="shrink-0 border-b border-deep-moss/[0.08] dark:border-dark-moss/15">
        <p className="px-4 pt-3 pb-1 text-caption font-medium uppercase tracking-wider text-deep-moss/50 dark:text-dark-moss/50">
          Chat with Doc
        </p>
        <div className="flex min-w-0 items-center gap-3 px-4 pb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-deep-moss/10 dark:bg-dark-moss/15">
            <FileText className="h-4 w-4 text-deep-moss dark:text-dark-moss" />
          </div>
          <span className="truncate text-body font-semibold text-deep-moss dark:text-dark-moss">
            {fileName}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-body ${
                msg.sender === "user"
                  ? "bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-dark-sage"
                  : "rounded-bl-md bg-pale-sage text-deep-moss dark:bg-dark-sage-elevated dark:text-dark-moss border border-deep-moss/[0.08] dark:border-dark-moss/15"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {msg.text || (i === messages.length - 1 && isChatLoading ? "…" : "")}
              </p>
            </div>
          </div>
        ))}
        {isChatLoading && messages[messages.length - 1]?.sender !== "ai" && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-deep-moss/[0.08] bg-pale-sage px-4 py-3 dark:border-dark-moss/15 dark:bg-dark-sage-elevated">
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/50 dark:bg-dark-moss/50 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/50 dark:bg-dark-moss/50 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/50 dark:bg-dark-moss/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-deep-moss/[0.08] p-4 dark:border-dark-moss/15">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            className="w-full rounded-xl border border-deep-moss/15 bg-pale-sage py-3 pl-4 pr-12 text-body text-deep-moss placeholder:text-deep-moss/45 focus:border-deep-moss/30 focus:outline-none focus:ring-2 focus:ring-soft-clay/25 dark:border-dark-moss/20 dark:bg-dark-sage dark:text-dark-moss dark:placeholder:text-dark-moss/45 dark:focus:border-dark-moss/35 dark:focus:ring-dark-clay/25"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isChatLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-deep-moss/55 transition-colors duration-150 hover:text-soft-clay disabled:opacity-50 dark:text-dark-moss/55 dark:hover:text-dark-clay"
            onClick={handleSendMessage}
            disabled={isChatLoading}
            aria-label="Send"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
