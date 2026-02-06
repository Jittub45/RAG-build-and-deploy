"use client";

import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-[#00d4aa] to-[#00b894] text-white shadow-lg shadow-[#00d4aa]/20"
            : "bg-[#252542] text-[#e5e5e5] border border-[#353560]"
        }`}
      >
        {/* Avatar and label */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
            isUser ? "bg-white/20 text-white" : "bg-[#00d4aa] text-white"
          }`}>
            {isUser ? "U" : "AI"}
          </div>
          <span className={`text-xs font-semibold ${isUser ? "text-white/80" : "text-[#8b8b9e]"}`}>
            {isUser ? "You" : "F1 Assistant"}
          </span>
        </div>

        {/* Message content */}
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <p className="m-0">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-[#00d4aa]">{children}</strong>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                code: ({ children }) => (
                  <code className="bg-[#1a1a2e] px-1 rounded text-xs text-[#00d4aa]">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[#1a1a2e] p-2 rounded overflow-x-auto text-xs">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
