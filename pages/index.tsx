import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSession {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  createdAt: number;
}

const openings = [
  "Apa yang bisa Roco bantu hari ini?",
  "Ada ide seru apa yang mau kita bahas?",
  "Butuh bantuan koding atau sekadar ngobrol?",
  "Halo! Roco siap membantu tugasmu.",
  "Siap eksplorasi hal baru hari ini?",
  "Ada masalah kode yang bikin pusing? Sini Roco bantu!",
  "Roco AI aktif. Apa perintahmu?",
  "Mari kita selesaikan proyek ini bersama!",
];

export default function Home() {
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [randomOpening, setRandomOpening] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // State untuk Modals
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "rename" | "delete" | "clearAll";
    targetId?: string;
    value?: string;
  }>({ isOpen: false, type: "delete" });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem("roco_sessions");
    const savedTheme = localStorage.getItem("theme");
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    }
    if (savedTheme === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * openings.length);
    setRandomOpening(openings[randomIdx]);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem("roco_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  const currentSession = sessions.find((s) => s.id === activeSessionId);
  const chatLog = currentSession?.messages || [];

  // ACTIONS
  const handleRenameAction = () => {
    if (modalConfig.targetId && modalConfig.value?.trim()) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === modalConfig.targetId
            ? { ...s, title: modalConfig.value! }
            : s
        )
      );
      closeModal();
    }
  };

  const handleDeleteAction = () => {
    if (modalConfig.targetId) {
      const updatedSessions = sessions.filter(
        (s) => s.id !== modalConfig.targetId
      );
      setSessions(updatedSessions);
      if (activeSessionId === modalConfig.targetId) {
        setActiveSessionId(
          updatedSessions.length > 0 ? updatedSessions[0].id : null
        );
      }
      closeModal();
    }
  };

  const handleClearAllAction = () => {
    localStorage.removeItem("roco_sessions");
    setSessions([]);
    setActiveSessionId(null);
    setIsSidebarOpen(false);
    closeModal();
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    setActiveMenuId(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    let sessionId = activeSessionId;
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession = {
        id: newId,
        title: input.substring(0, 30),
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([newSession]);
      setActiveSessionId(newId);
      sessionId = newId;
    }
    const userMsg = { role: "user", content: input };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: s.messages.length === 0 ? input.substring(0, 30) : s.title,
            }
          : s
      )
    );
    setInput("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, history: chatLog }),
      });
      const data = await response.json();
      const aiMsg = { role: "ai", content: data.text };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, messages: [...s.messages, aiMsg] } : s
        )
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kode disalin!");
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-[#171717] text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out border-r shadow-2xl
        ${
          isDarkMode
            ? "bg-[#171717] border-white/10"
            : "bg-slate-50 border-slate-200"
        }
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full p-4">
          <button
            onClick={() => {
              const newId = Date.now().toString();
              setSessions([
                {
                  id: newId,
                  title: "Chat Baru",
                  messages: [],
                  createdAt: Date.now(),
                },
                ...sessions,
              ]);
              setActiveSessionId(newId);
              setIsSidebarOpen(false);
            }}
            className={`w-full mb-6 p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all
            ${
              isDarkMode
                ? "border-white/10 hover:bg-white/5 text-white"
                : "border-slate-200 hover:bg-white shadow-sm text-slate-700"
            }`}
          >
            <span className="text-xl">+</span> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">
              History
            </p>
            {sessions.map((s) => (
              <div key={s.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 pr-10 rounded-xl text-sm truncate transition-all ${
                    activeSessionId === s.id
                      ? isDarkMode
                        ? "bg-white/10 text-white"
                        : "bg-white shadow-sm border border-slate-200 text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {s.title}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === s.id ? null : s.id);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-opacity ${
                    activeSessionId === s.id
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5"
                    />
                  </svg>
                </button>

                {activeMenuId === s.id && (
                  <div
                    ref={menuRef}
                    className={`absolute right-0 mt-1 w-32 rounded-lg shadow-lg border z-[60] py-1 ${
                      isDarkMode
                        ? "bg-[#252525] border-white/10 text-white"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          type: "rename",
                          targetId: s.id,
                          value: s.title,
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          type: "delete",
                          targetId: s.id,
                        })
                      }
                      className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className={`mt-4 pt-4 border-t ${
              isDarkMode ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div className="flex flex-col gap-1 px-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 tracking-tight">
                Roco AI v.1.1
              </span>
              <span className="text-[10px] text-slate-500">
                Created by{" "}
                <span className="font-semibold text-blue-500">Arno</span>
              </span>
            </div>
            <button
              onClick={() => setModalConfig({ isOpen: true, type: "clearAll" })}
              className="w-full p-2 text-[11px] font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors text-center"
            >
              Clear All Memory
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL SYSTEM */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div
            className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-in fade-in zoom-in duration-200 ${
              isDarkMode
                ? "bg-[#252525] border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <h3 className="text-lg font-bold mb-2">
              {modalConfig.type === "rename"
                ? "Rename Chat"
                : modalConfig.type === "delete"
                ? "Delete Chat"
                : "Clear All History"}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {modalConfig.type === "rename"
                ? "Masukkan nama baru untuk percakapan ini."
                : "Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?"}
            </p>

            {modalConfig.type === "rename" && (
              <input
                autoFocus
                className={`w-full p-3 rounded-xl border mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
                value={modalConfig.value}
                onChange={(e) =>
                  setModalConfig({ ...modalConfig, value: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleRenameAction()}
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-100"
                }`}
              >
                Batal
              </button>
              <button
                onClick={
                  modalConfig.type === "rename"
                    ? handleRenameAction
                    : modalConfig.type === "delete"
                    ? handleDeleteAction
                    : handleClearAllAction
                }
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-all ${
                  modalConfig.type === "rename"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <nav
          className={`border-b py-3 px-6 flex justify-between items-center z-20 backdrop-blur-md ${
            isDarkMode
              ? "border-white/10 bg-[#171717]/80"
              : "border-slate-200 bg-white/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="group flex items-center gap-2 outline-none"
            >
              <span className="font-bold text-lg tracking-tight group-hover:text-blue-500 transition-colors">
                Roco AI
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-all ${
                  isSidebarOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-yellow-400 hover:bg-white/5"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto p-4 space-y-8 pb-32">
            {chatLog.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center pt-24 text-slate-400 space-y-3">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl border ${
                    isDarkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  🤖
                </div>
                <p className="text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
                  {randomOpening}
                </p>
              </div>
            )}
            {chatLog.map((chat, i) => (
              <div
                key={i}
                className={`flex gap-4 ${
                  chat.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-[10px] font-bold shadow-sm ${
                    chat.role === "user"
                      ? isDarkMode
                        ? "bg-white text-black border-white"
                        : "bg-slate-900 text-white border-slate-900"
                      : isDarkMode
                      ? "border-white/10"
                      : "border-slate-200"
                  }`}
                >
                  {chat.role === "user" ? "U" : "R"}
                </div>
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${
                    chat.role === "user"
                      ? isDarkMode
                        ? "bg-[#2f2f2f]"
                        : "bg-slate-100"
                      : ""
                  }`}
                >
                  <div
                    className={`prose max-w-full overflow-hidden break-words ${
                      isDarkMode ? "prose-invert" : "prose-slate"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre({ children }: any) {
                          const codeString = children?.props?.children || "";
                          return (
                            <div
                              className={`relative my-4 rounded-xl border overflow-hidden ${
                                isDarkMode
                                  ? "border-white/10"
                                  : "border-slate-200"
                              }`}
                            >
                              <div
                                className={`px-4 py-1.5 border-b flex justify-between items-center text-[10px] ${
                                  isDarkMode
                                    ? "bg-[#252525] border-white/10"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <span className="font-mono opacity-50 uppercase tracking-tighter">
                                  code snippet
                                </span>
                                <button
                                  onClick={() =>
                                    copyCode(
                                      String(codeString).replace(/\n$/, "")
                                    )
                                  }
                                  className="hover:text-blue-500 font-bold transition-colors"
                                >
                                  Copy
                                </button>
                              </div>
                              <pre className="bg-[#0D0D0D] p-4 overflow-x-auto text-[13px] text-slate-300 custom-scrollbar">
                                {children}
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {chat.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-[11px] text-slate-500 animate-pulse ml-12">
                <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                <span>Roco AI sedang mengetik...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        <div
          className={`p-4 border-t ${
            isDarkMode
              ? "bg-[#171717] border-white/5"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            <div className="relative flex items-end">
              {" "}
              {/* Ubah items-center jadi items-end */}
              <textarea
                rows={1}
                className={`w-full p-4 pr-16 rounded-2xl shadow-sm focus:outline-none transition-all text-[15px] resize-none overflow-y-auto max-h-40 ${
                  isDarkMode
                    ? "bg-[#2f2f2f] border-white/10 text-white placeholder:text-slate-500"
                    : "bg-white border-slate-300 text-slate-900 shadow-sm placeholder:text-slate-400"
                }`}
                placeholder="Tanya Roco AI..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize logic
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Mencegah baris baru saat Enter saja
                    handleSend();
                    // Reset height setelah kirim
                    (e.target as HTMLTextAreaElement).style.height = "auto";
                  }
                }}
              />
              <button
                onClick={() => {
                  handleSend();
                  // Reset height textarea manual jika perlu melalui ref
                }}
                disabled={isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                  isDarkMode
                    ? "bg-white text-black hover:bg-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                } disabled:opacity-20`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
                  />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-500 font-medium tracking-tight">
              Roco AI can make mistakes, so double check-it.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        .zoom-in {
          animation: zoomIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
