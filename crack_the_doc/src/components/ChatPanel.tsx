import { useState } from "react";
import { FileText, Eye, SendHorizontal } from "lucide-react";
import { getChatbotResponse } from "../lib/groq";
import { safeJsonParse } from "../lib/utils";

type Props = {
  fileName: string;
  onPreviewClick: () => void;
  documentContent: string;
};

type Message = { sender: "ai" | "user"; text: string };

const ChatPanel = ({ fileName, onPreviewClick, documentContent }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I'm DocWiz, your guide for this document. I'm here to help you understand the material. Ask me anything about it.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsChatLoading(true);
    try {
      const completion = await getChatbotResponse(documentContent, inputValue);
      const aiResponse =
        safeJsonParse(completion.choices[0]?.message?.content || "{}", {}).response ||
        "Sorry, I could not process that.";
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error) {
      const errorMessage: Message = {
        sender: "ai",
        text:
          error instanceof Error && error.message.includes("VITE_GROQ_API_KEY")
            ? "API key is not configured. Please set VITE_GROQ_API_KEY in your .env file."
            : "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setIsChatLoading(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-deep-moss/15 bg-white shadow-soft dark:border-dark-moss/20 dark:bg-dark-sage-surface dark:shadow-soft-dark">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-deep-moss/10 px-4 py-3 dark:border-dark-moss/20">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-deep-moss/10 dark:bg-dark-moss/20">
            <FileText className="h-4 w-4 text-deep-moss dark:text-dark-moss" />
          </div>
          <span className="truncate text-sm font-medium text-deep-moss dark:text-dark-moss">
            {fileName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPreviewClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-deep-moss/70 hover:bg-deep-moss/10 hover:text-deep-moss dark:text-dark-moss/70 dark:hover:bg-dark-moss/20 dark:hover:text-dark-moss"
            title="Preview document"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-deep-moss/80 hover:bg-deep-moss/10 dark:text-dark-moss/80 dark:hover:bg-dark-moss/20"
          >
            New session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.sender === "user"
                  ? "bg-deep-moss text-pale-sage dark:bg-dark-moss dark:text-dark-sage"
                  : "bg-pale-sage text-deep-moss dark:bg-dark-sage dark:text-dark-moss border border-deep-moss/10 dark:border-dark-moss/20"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 rounded-2xl border border-deep-moss/10 bg-pale-sage px-4 py-2.5 dark:border-dark-moss/20 dark:bg-dark-sage">
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/60 dark:bg-dark-moss/60 [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/60 dark:bg-dark-moss/60 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-deep-moss/60 dark:bg-dark-moss/60 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-deep-moss/10 p-4 dark:border-dark-moss/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            className="w-full rounded-xl border border-deep-moss/20 bg-pale-sage py-3 pl-4 pr-12 text-deep-moss placeholder:text-deep-moss/50 focus:border-deep-moss/40 focus:outline-none focus:ring-2 focus:ring-soft-clay/30 dark:border-dark-moss/30 dark:bg-dark-sage dark:text-dark-moss dark:placeholder:text-dark-moss/50 dark:focus:border-dark-moss/50 dark:focus:ring-dark-clay/30"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isChatLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-deep-moss/60 hover:text-soft-clay dark:text-dark-moss/60 dark:hover:text-dark-clay disabled:opacity-50"
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
