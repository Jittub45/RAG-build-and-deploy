import { Chat } from "./components/Chat";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen f1-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-md border-b border-[#00d4aa]/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4aa] to-[#00b894] rounded-lg flex items-center justify-center shadow-lg shadow-[#00d4aa]/20">
              <span className="text-white font-bold text-lg">F1</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                F1 Assistant
              </h1>
              <p className="text-xs text-[#8b8b9e]">
                Your Formula 1 Knowledge Hub
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-[#00d4aa]">
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        <Chat />
      </main>
    </div>
  );
}
