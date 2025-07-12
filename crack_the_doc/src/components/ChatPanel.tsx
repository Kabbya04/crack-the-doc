import { useState } from 'react';
import { FileText, Eye, SendHorizontal } from 'lucide-react';
import { getChatbotResponse } from '../lib/groq';
import { safeJsonParse } from '../lib/utils';

type Props = {
  fileName: string;
  onPreviewClick: () => void;
  documentContent: string;
};

type Message = {
  sender: 'ai' | 'user';
  text: string;
};

const ChatPanel = ({ fileName, onPreviewClick, documentContent }: Props) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm DocWiz, your personal guide for this document. I'm here to help you understand the material better. Feel free to ask me anything about it!" },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsChatLoading(true);

    try {
      const completion = await getChatbotResponse(documentContent, inputValue);
      const aiResponse = safeJsonParse(completion.choices[0]?.message?.content || '{}', {}).response || 'Sorry, I could not process that.';
      const aiMessage: Message = {
        sender: 'ai',
        text: aiResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
        if (error instanceof Error && error.message.includes("VITE_GROQ_API_KEY")) {
            const errorMessage: Message = {
                sender: 'ai',
                text: 'API key is not configured. Please set VITE_GROQ_API_KEY in your .env file.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } else {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                sender: 'ai',
                text: 'Sorry, there was an error processing your request.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    }
    setIsChatLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2 font-semibold">
          <FileText className="w-5 h-5 text-gray-500" />
          <span>{fileName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviewClick}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Preview Document"
          >
            <Eye className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-grow p-4 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start">
            <div className="max-w-md p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
              <p className='animate-pulse'>...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask a question about the document..."
            className="w-full pl-4 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isChatLoading}
          />
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-500"
            onClick={handleSendMessage}
            disabled={isChatLoading}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
