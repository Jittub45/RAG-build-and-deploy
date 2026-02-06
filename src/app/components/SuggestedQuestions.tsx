"use client";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  {
    icon: "🏆",
    question: "Who won the last F1 World Championship?",
    category: "Champions",
  },
  {
    icon: "📊",
    question: "What are the current driver standings?",
    category: "Standings",
  },
  {
    icon: "👤",
    question: "Tell me about Max Verstappen's career",
    category: "Drivers",
  },
  {
    icon: "🚗",
    question: "What's the history of Ferrari in F1?",
    category: "Teams",
  },
  {
    icon: "📋",
    question: "How does the F1 points system work?",
    category: "Rules",
  },
  {
    icon: "📍",
    question: "What circuits are on the 2025 calendar?",
    category: "Circuits",
  },
];

export function SuggestedQuestions({
  onSelectQuestion,
}: SuggestedQuestionsProps) {
  return (
    <div className="w-full max-w-2xl">
      <p className="text-sm text-[#8b8b9e] mb-3">
        Try asking:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTED_QUESTIONS.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(item.question)}
            className="flex items-center gap-3 p-3 text-left rounded-xl border border-[#353560] 
                       hover:border-[#00d4aa] bg-[#252542]/50
                       hover:bg-[#252542] transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-[#353560] rounded-lg flex items-center justify-center group-hover:bg-[#00d4aa] transition-colors">
              <span className="text-[#00d4aa] group-hover:text-white text-lg">{item.icon}</span>
            </div>
            <div>
              <span className="text-xs text-[#00d4aa] uppercase tracking-wide font-medium">
                {item.category}
              </span>
              <p className="text-sm text-[#e5e5e5] group-hover:text-white">
                {item.question}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
