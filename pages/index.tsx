import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: string; content: string }[]>(
    []
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [aiPersonality, setAiPersonality] = useState("friendly"); // friendly, formal, casu

  // Auto scroll ke pesan paling bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    const savedChat = localStorage.getItem("ai_memory");
    if (savedChat) setChatLog(JSON.parse(savedChat));
  }, []);

  // Pastikan bagian handleSend mengirim chatLog sebagai history
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    const newHistory = [...chatLog, userMsg];
    setChatLog(newHistory);
    setInput("");

    try {
      const response = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          history: chatLog, // Tambahkan ini agar API bisa membaca konteks sebelumnya
        }),
      });

      const data = await response.json();
      const aiMsg = { role: "ai", content: data.text, topic: data.topic };

      const finalHistory = [...newHistory, aiMsg];
      setChatLog(finalHistory);
      localStorage.setItem("ai_memory", JSON.stringify(finalHistory));
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Container Utama */}
      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            RocoAI Engine
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("ai_memory");
              setChatLog([]);
            }}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Clear Memory
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatLog.length === 0 && (
            <div className="text-center text-slate-500 mt-10 italic">
              Belum ada percakapan. Mulailah menyapa AI!
              (AI ini masih dalam pengembangan, sementara bisa untuk research data dan perhitungan saja)
            </div>
          )}
          {chatLog.map((chat, i) => (
            <div
              key={i}
              className={`flex ${
                chat.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                  chat.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-700 text-slate-100 rounded-tl-none border border-slate-600"
                }`}
              >
                <p className="text-[10px] uppercase font-bold mb-1 opacity-70">
                  {chat.role === "user" ? "Anda" : "Mini AI"}
                </p>
                <p className="text-sm leading-relaxed">{chat.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-850 border-t border-slate-700 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-slate-900 border border-slate-600 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              placeholder="Ketik pesan di sini..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
            >
              Kirim
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-2">
            AI ini berjalan sepenuhnya tanpa API external (Rule-Based Engine)
          </p>
        </div>
      </div>
    </div>
  );
}
