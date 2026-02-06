"use client";

import { FormEvent, ChangeEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your question here..."
          disabled={isLoading}
          rows={1}
          className="w-full px-4 py-3 pr-12 rounded-xl border border-[#353560] 
                     bg-[#252542] text-[#e5e5e5] placeholder-[#6b6b80]
                     focus:outline-none focus:ring-2 focus:ring-[#00d4aa] focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     resize-none min-h-[48px] max-h-[120px]"
          style={{
            height: "auto",
            minHeight: "48px",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="px-6 py-3 bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#009d7a] disabled:from-[#353560] disabled:to-[#353560] 
                   text-white font-semibold rounded-xl transition-all duration-200
                   disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#00d4aa]/20 disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="hidden sm:inline">Processing...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </>
        )}
      </button>
    </form>
  );
}
