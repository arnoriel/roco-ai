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
  "Apa yang ingin kamu riset hari ini?",
  "Butuh info terbaru tentang apa?",
  "Halo! Roco siap mencarikan informasi untukmu.",
  "Ada topik hangat yang mau kita bedah?",
  "Siap eksplorasi data terbaru hari ini?",
  "Roco AI aktif. Masukkan topik risetmu!",
  "Mari kita cari tahu kebenarannya bersama.",
  "Tanyakan apa saja, Roco akan carikan jawabannya!"
];

const CodeBlock = ({ node, inline, className, children, dark, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className={`my-4 rounded-xl overflow-hidden border shadow-sm group/code relative 
        ${dark ? "bg-[#0d0d0d] border-white/10" : "bg-slate-900 border-slate-200"}`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b 
          ${dark ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5"}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{match[1]}</span>
          <button onClick={handleCopy} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <div className="p-4 overflow-x-auto custom-scrollbar">
          <code className="text-sm font-mono leading-relaxed text-slate-100" {...props}>{children}</code>
        </div>
      </div>
    );
  }
  return (
    <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${dark ? "bg-white/10 text-pink-400" : "bg-slate-100 text-pink-600"}`} {...props}>
      {children}
    </code>
  );
};

export default function Home() {
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isLoading, setIsLoading] = useState(false);
  
  // PERUBAHAN 1: Default state diubah menjadi true (Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [randomOpening, setRandomOpening] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "rename" | "delete" | "clearAll";
    targetId?: string;
    value?: string;
  }>({ isOpen: false, type: "delete" });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createNewChat = (isInitial = false) => {
    const newId = Date.now().toString();
    const newSession = { id: newId, title: "Chat Baru", messages: [], createdAt: Date.now() };
    if (isInitial) {
      setSessions([newSession]);
    } else {
      setSessions(prev => [newSession, ...prev]);
    }
    setActiveSessionId(newId);
  };

  useEffect(() => {
    const savedSessions = localStorage.getItem("roco_sessions");
    const savedActiveId = localStorage.getItem("roco_active_id");
    const savedTheme = localStorage.getItem("theme");

    // PERUBAHAN 2: Jika user secara eksplisit menyimpan "light", baru ganti ke light. 
    // Jika tidak ada data (user baru), tetap default Dark.
    if (savedTheme === "light") {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
    }
    
    if (window.innerWidth < 1024) setIsSidebarOpen(false);

    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        const exists = parsed.find((s: ChatSession) => s.id === savedActiveId);
        setActiveSessionId(exists ? savedActiveId : parsed[0].id);
      } else {
        createNewChat(true);
      }
    } else {
      createNewChat(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("roco_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("roco_active_id", activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * openings.length);
    setRandomOpening(openings[randomIdx]);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isLoading]);

  const currentSession = sessions.find(s => s.id === activeSessionId);
  const chatLog = currentSession?.messages || [];

  const handleSend = async (overrideInput?: string, isEdit: boolean = false, index?: number) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession = { id: newId, title: messageToSend.substring(0, 30), messages: [], createdAt: Date.now() };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newId);
      sessionId = newId;
    }

    let updatedHistory = [...chatLog];
    if (isEdit && index !== undefined) {
      updatedHistory = chatLog.slice(0, index);
      updatedHistory.push({ role: "user", content: messageToSend });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: updatedHistory } : s));
      setEditingIndex(null);
    } else {
      updatedHistory.push({ role: "user", content: messageToSend });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: updatedHistory, title: s.messages.length === 0 ? messageToSend.substring(0, 30) : s.title } : s));
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: messageToSend, history: updatedHistory.slice(0, -1) }),
      });
      const data = await response.json();
      const aiMsg = { role: "ai", content: data.text };
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedHistory, aiMsg] } : s));
    } catch (error) { console.error("Error:", error); } finally { setIsLoading(false); }
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
    setActiveMenuId(null);
  };

  const handleRenameAction = () => {
    if (modalConfig.targetId && modalConfig.value?.trim()) {
      setSessions(prev => prev.map(s => s.id === modalConfig.targetId ? { ...s, title: modalConfig.value! } : s));
      closeModal();
    }
  };

  const handleDeleteAction = () => {
    if (modalConfig.targetId) {
      const updatedSessions = sessions.filter(s => s.id !== modalConfig.targetId);
      setSessions(updatedSessions);
      if (activeSessionId === modalConfig.targetId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
        } else {
          createNewChat(true);
        }
      }
      closeModal();
    }
  };

  const handleClearAllAction = () => {
    setSessions([]);
    createNewChat(true);
    closeModal();
  };

  return (
    <div className={`h-screen flex overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-[#171717] text-white" : "bg-white text-slate-900"}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col transition-[width,transform] duration-300 ease-in-out border-r
        ${isDarkMode ? "bg-[#171717] border-white/10" : "bg-slate-50 border-slate-200"}
        ${isSidebarOpen 
            ? "w-72 translate-x-0" 
            : "w-0 -translate-x-full lg:translate-x-0 overflow-hidden"}`}>
        
        <div className="w-72 flex flex-col h-full p-4 shrink-0">
          <button onClick={() => { createNewChat(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} 
            className={`w-full mb-6 p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all
            ${isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-white shadow-sm text-slate-700"}`}>
            <span className="text-xl">+</span> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">History</p>
            {sessions.map((s) => (
              <div key={s.id} className="relative group">
                <button onClick={() => { setActiveSessionId(s.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`w-full text-left p-3 pr-10 rounded-xl text-sm truncate transition-all ${activeSessionId === s.id 
                    ? (isDarkMode ? "bg-white/10 text-white" : "bg-white shadow-sm border border-slate-200 text-slate-900") 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                  {s.title}
                </button>
                <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === s.id ? null : s.id); }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-opacity ${activeSessionId === s.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5" /></svg>
                </button>
                {activeMenuId === s.id && (
                  <div ref={menuRef} className={`absolute right-0 mt-1 w-32 rounded-lg shadow-lg border z-[60] py-1 ${isDarkMode ? "bg-[#252525] border-white/10 text-white" : "bg-white border-slate-200 text-slate-700"}`}>
                    <button onClick={() => setModalConfig({ isOpen: true, type: "rename", targetId: s.id, value: s.title })} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors">Rename</button>
                    <button onClick={() => setModalConfig({ isOpen: true, type: "delete", targetId: s.id })} className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
            <div className="flex flex-col gap-1 px-2 mb-4">
              <span className="text-[11px] font-bold text-slate-400 tracking-tight">Roco AI v.1.1.3</span>
              <span className="text-[10px] text-slate-500">Created by <span className="font-semibold text-blue-500">Arno</span></span>
            </div>
            <button onClick={() => setModalConfig({ isOpen: true, type: "clearAll" })} className="w-full p-2 text-[11px] font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors text-center">Clear All History</button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <nav className={`sticky top-0 left-0 right-0 border-b py-3 px-6 flex justify-between items-center z-30 backdrop-blur-md ${isDarkMode ? "border-white/10 bg-[#171717]/90" : "border-slate-200 bg-white/90"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="group flex items-center gap-2 outline-none">
              <span className="font-bold text-lg tracking-tight group-hover:text-blue-500 transition-colors">Roco AI</span>
            </button>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-yellow-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>{isDarkMode ? "☀️" : "🌙"}</button>
        </nav>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto p-4 space-y-8 pb-32">
            {chatLog.length === 0 && (
              <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>🔍</div>
                <p className="text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-700 text-center px-6">{randomOpening}</p>
              </div>
            )}
            {chatLog.map((chat, i) => (
              <div key={i} className={`flex gap-3 md:gap-4 group ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-[10px] font-bold shadow-sm ${chat.role === "user" ? (isDarkMode ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900") : (isDarkMode ? "border-white/10" : "border-slate-200")}`}>{chat.role === "user" ? "U" : "R"}</div>
                <div className="flex flex-col gap-1.5 max-w-[88%] md:max-w-[85%]">
                  <div className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${chat.role === "user" ? (isDarkMode ? "bg-[#2f2f2f]" : "bg-white border border-slate-100 shadow-sm") : ""}`}>
                    <div className={`prose prose-sm md:prose-base max-w-full overflow-hidden break-words ${isDarkMode ? "prose-invert" : "prose-slate"}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: (props) => <CodeBlock {...props} dark={isDarkMode} /> }}>{chat.content}</ReactMarkdown>
                    </div>
                  </div>
                  <div className={`flex items-center gap-4 px-1 ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <button onClick={() => { navigator.clipboard.writeText(chat.content); setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 1000); }} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors p-1">
                      {copiedIndex === i ? <span className="text-[10px] font-bold text-blue-500">Copied!</span> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>}
                    </button>
                    {chat.role === "user" && <button onClick={() => { setEditingIndex(i); setInput(chat.content); textareaRef.current?.focus(); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <div className="flex gap-2 items-center text-[11px] text-slate-500 animate-pulse ml-11"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" /><span>Roco sedang mengetik...</span></div>}
            <div ref={chatEndRef} />
          </div>
        </main>

        <div className={`p-4 border-t z-20 ${isDarkMode ? "bg-[#171717] border-white/5" : "bg-white border-slate-100"}`}>
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            <div className="relative flex items-end">
              <textarea ref={textareaRef} rows={1} className={`w-full p-4 pr-14 rounded-2xl shadow-sm focus:outline-none transition-all text-[15px] resize-none overflow-y-auto max-h-40 ${isDarkMode ? "bg-[#2f2f2f] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"}`} placeholder={editingIndex !== null ? "Edit pesanmu..." : "Tanya Roco AI..."} value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input, editingIndex !== null, editingIndex ?? undefined); }}}
              />
              <button onClick={() => !isLoading && handleSend(input, editingIndex !== null, editingIndex ?? undefined)} className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${isDarkMode ? "bg-white text-black" : "bg-slate-900 text-white"}`}>
                {isLoading ? <div className="w-5 h-5 flex items-center justify-center"><div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-black' : 'bg-white'} animate-pulse`} /></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>}
              </button>
            </div>
            {editingIndex !== null && (
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] text-blue-500 font-bold italic uppercase tracking-wider">Mode Edit Aktif</p>
                <button onClick={() => { setEditingIndex(null); setInput(""); if(textareaRef.current) textareaRef.current.style.height="auto"; }} className="text-[10px] text-red-500 hover:underline font-bold">Batal Edit</button>
              </div>
            )}
            <p className="text-[10px] text-center text-slate-500 font-medium tracking-tight mt-1 opacity-70">Roco AI v.1.1.3 — Roco can make mistakes.</p>
          </div>
        </div>
      </div>

      {/* MODAL SYSTEM */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-in fade-in zoom-in duration-200 ${isDarkMode ? "bg-[#252525] border-white/10" : "bg-white border-slate-200"}`}>
            <h3 className="text-lg font-bold mb-2">{modalConfig.type === "rename" ? "Rename Chat" : modalConfig.type === "delete" ? "Delete Chat" : "Clear All History"}</h3>
            <p className="text-sm text-slate-500 mb-6">{modalConfig.type === "rename" ? "Ganti nama sesi riset ini." : modalConfig.type === "delete" ? "Yakin ingin menghapus sesi ini?" : "Hapus semua history?"}</p>
            {modalConfig.type === "rename" && <input autoFocus className={`w-full p-3 rounded-xl border mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} value={modalConfig.value} onChange={(e) => setModalConfig({ ...modalConfig, value: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleRenameAction()} />}
            <div className="flex gap-3 justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm">Batal</button>
              <button onClick={modalConfig.type === "rename" ? handleRenameAction : modalConfig.type === "delete" ? handleDeleteAction : handleClearAllAction} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${modalConfig.type === "rename" ? "bg-blue-600" : "bg-red-600"}`}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MOBILE */}
      <div 
        onClick={() => setIsSidebarOpen(false)} 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300
          ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
        .zoom-in { animation: zoomIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}
