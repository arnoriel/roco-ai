import React from "react";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";

interface UserProfile {
  name: string;
  avatar: string;
}
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

const YouTubePlayer = ({ videoId }: { videoId: string }) => (
  <div className="my-4 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
    <iframe
      width="100%"
      height="315"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
);

const ModeDropdown = ({ selectedMode, setSelectedMode, isDarkMode }: { selectedMode: string, setSelectedMode: (mode: string) => void, isDarkMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)} className={`p-1 rounded-lg border text-xs ${isDarkMode ? "bg-[#2f2f2f] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        {selectedMode}
      </button>
      {isOpen && (
        <div className={`absolute bottom-full mb-1 w-32 rounded-lg shadow-lg border py-1 animate-dropdownOpen ${isDarkMode ? "bg-[#252525] border-white/10 text-white" : "bg-white border-slate-200 text-slate-700"}`}>
          <button onClick={() => { setSelectedMode("Vanilla"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors">Vanilla</button>
          <button onClick={() => { setSelectedMode("Seronic"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors">Seronic</button>
          <button onClick={() => { setSelectedMode("Homule"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors">Homule</button>
          <button onClick={() => { setSelectedMode("Corsero"); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-colors">Corsero</button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [randomOpening, setRandomOpening] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempProfileName, setTempProfileName] = useState("");
  const [tempProfileAvatar, setTempProfileAvatar] = useState("");
  const [selectedMode, setSelectedMode] = useState("Vanilla");
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "rename" | "delete" | "clearAll";
    targetId?: string;
    value?: string;
  }>({ isOpen: false, type: "delete" });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Typewriter & interrupt states
  const [displayedMessages, setDisplayedMessages] = useState<{ [key: number]: string }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [typewriterIntervalId, setTypewriterIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [interruptedIndex, setInterruptedIndex] = useState<number | null>(null);

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
    const savedMode = localStorage.getItem("roco_mode");
    const savedProfile = localStorage.getItem("roco_profile");

    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (savedTheme === "light") setIsDarkMode(false);
    if (savedMode) setSelectedMode(savedMode);
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
    localStorage.setItem("roco_mode", selectedMode);
  }, [selectedMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession && currentSession.messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [sessions, activeSessionId, isLoading, displayedMessages, isTyping]);

  useEffect(() => {
    return () => {
      if (typewriterIntervalId) clearInterval(typewriterIntervalId);
    };
  }, [typewriterIntervalId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) return alert("Ukuran file terlalu besar! Maksimal 1MB.");
      const reader = new FileReader();
      reader.onloadend = () => setTempProfileAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setTempProfileAvatar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = () => {
    const newProfile = { name: tempProfileName.trim(), avatar: tempProfileAvatar.trim() };
    if (!newProfile.name) return alert("Nama harus diisi!");
    localStorage.setItem("roco_profile", JSON.stringify(newProfile));
    setUserProfile(newProfile);
    setIsProfileModalOpen(false);
  };

  const openProfileModal = () => {
    if (userProfile) {
      setTempProfileName(userProfile.name);
      setTempProfileAvatar(userProfile.avatar);
    } else {
      setTempProfileName("");
      setTempProfileAvatar("");
    }
    setIsProfileModalOpen(true);
  };

  const currentSession = sessions.find(s => s.id === activeSessionId);
  const chatLog = currentSession?.messages || [];

  const generateChatTitle = async (sessionId: string, messages: { role: string; content: string }[]) => {
    try {
      const context = messages.map(m => `${m.role === 'user' ? 'User: ' : 'AI: '} ${m.content}`).join('\n\n');
      const response = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Buat judul chat pendek (max 30 karakter) berdasarkan konteks ini: ${context}. Judul harus ringkas, deskriptif, dan dalam bahasa Indonesia jika konteksnya begitu.`,
          history: [],
          userName: userProfile?.name,
          mode: selectedMode,
          isTitleGeneration: true
        }),
      });
      const data = await response.json();
      const newTitle = data.text.trim().substring(0, 30);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: newTitle || s.title } : s));
    } catch (error) {
      console.error("Error generating title:", error);
    }
  };

  const handleInterrupt = () => {
    if (typewriterIntervalId) {
      clearInterval(typewriterIntervalId);
      setTypewriterIntervalId(null);
    }
    setIsTyping(false);
    const lastIndex = chatLog.length - 1;
    if (chatLog[lastIndex]?.role === "ai") {
      setInterruptedIndex(lastIndex);
    }
  };

  const handleSend = async (overrideInput?: string, isEdit: boolean = false, index?: number) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession = { id: newId, title: "Chat Baru", messages: [], createdAt: Date.now() };
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
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedHistory], title: s.messages.length === 0 ? messageToSend.substring(0, 30) : s.title } : s));
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch("/api/AI", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: messageToSend,
          history: updatedHistory.slice(0, -1),
          userName: userProfile?.name,
          mode: selectedMode
        }),
      });
      const data = await response.json();
      const aiMsg = { role: "ai", content: data.text };

      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? { ...s, messages: [...updatedHistory, { ...aiMsg, content: "" }] }
          : s
      ));

      const newIndex = updatedHistory.length;
      setDisplayedMessages(prev => ({ ...prev, [newIndex]: '' }));
      setIsTyping(true);
      setIsLoading(false);
      setInterruptedIndex(null);

      let i = 0;
      const fullContent = aiMsg.content;

      const interval = setInterval(() => {
        if (i < fullContent.length) {
          const currentText = fullContent.slice(0, i + 1);
          setDisplayedMessages(prev => ({ ...prev, [newIndex]: currentText }));
          setSessions(prev => prev.map(s =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m, idx) =>
                    idx === newIndex ? { ...m, content: currentText } : m
                  )
                }
              : s
          ));
          i++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setTypewriterIntervalId(null);
          setDisplayedMessages(prev => ({ ...prev, [newIndex]: fullContent }));
        }
      }, 20);

      setTypewriterIntervalId(interval);

      if (updatedHistory.length === 1) {
        await generateChatTitle(sessionId!, [...updatedHistory, aiMsg]);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
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
        updatedSessions.length > 0 ? setActiveSessionId(updatedSessions[0].id) : createNewChat(true);
      }
      closeModal();
    }
  };

  const handleClearAllAction = () => {
    setSessions([]);
    createNewChat(true);
    closeModal();
  };

  const InputBox = () => (
    <div className="w-full relative flex items-end">
      <textarea
        ref={textareaRef}
        rows={1}
        className={`w-full p-4 pr-14 pb-10 rounded-2xl shadow-sm focus:outline-none transition-all text-[15px] resize-none overflow-y-auto max-h-40
          ${isDarkMode ? "bg-[#2f2f2f] border-white/10 text-white" : "bg-white border-slate-300 text-slate-900 shadow-sm"}`}
        placeholder={editingIndex !== null ? "Edit pesanmu..." : (userProfile ? `Tanya Roco, ${userProfile.name}...` : "Tanya Roco AI...")}
        value={input}
        onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input, editingIndex !== null, editingIndex ?? undefined); }}}
      />
      <div className="absolute bottom-3 left-3">
        <ModeDropdown selectedMode={selectedMode} setSelectedMode={setSelectedMode} isDarkMode={isDarkMode} />
      </div>

      {/* Tombol Send / Stop */}
      <button
        onClick={() => {
          if (isTyping) {
            handleInterrupt();
          } else if (!isLoading) {
            handleSend(input, editingIndex !== null, editingIndex ?? undefined);
          }
        }}
        disabled={isLoading && !isTyping}
        className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all flex items-center justify-center
          ${isTyping 
            ? "bg-red-500/20 hover:bg-red-500/40 text-red-400" 
            : (isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-slate-900 text-white hover:bg-slate-700")
          }`}
      >
        {isLoading && !isTyping ? (
          <div className="w-5 h-5 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-sm ${isDarkMode ? 'bg-black' : 'bg-white'} animate-pulse`} />
          </div>
        ) : isTyping ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className={`h-screen flex overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-[#171717] text-white" : "bg-white text-slate-900"}`}>
      {/* SIDEBAR - tetap sama */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-50 flex flex-col transition-[width,transform] duration-300 ease-in-out border-r
        ${isDarkMode ? "bg-[#171717] border-white/10" : "bg-slate-50 border-slate-200"}
        ${isSidebarOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 overflow-hidden"}`}>
        <div className="w-72 flex flex-col h-full p-4 shrink-0">
          <button onClick={() => { createNewChat(); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
            className={`w-full mb-6 p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all
            ${isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-slate-200 hover:bg-white shadow-sm text-slate-700"}`}>
            <span className="text-xl">+</span> Chat Baru
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
              <span className="text-[11px] font-bold text-slate-400 tracking-tight">Roco AI v.1.1.5</span>
              <span className="text-[10px] text-slate-500">Project Undergo With <span className="font-semibold text-blue-500">Aion Labs</span></span>
            </div>
            <Link href="/about"><button className="w-full p-2 text-[11px] font-medium text-blue-500 hover:text-blue-400 hover:bg-blue-500/5 rounded-lg transition-colors text-center mb-2">Tentang</button></Link>
            <button onClick={() => setModalConfig({ isOpen: true, type: "clearAll" })} className="w-full p-2 text-[11px] font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors text-center">Hapus semua History</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - tetap sama, hanya hapus tombol stop di bubble */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <nav className={`sticky top-0 left-0 right-0 border-b py-3 px-6 flex justify-between items-center z-30 backdrop-blur-md ${isDarkMode ? "border-white/10 bg-[#171717]/90" : "border-slate-200 bg-white/90"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="group flex items-center gap-2 outline-none">
              <Image src="/logo.png" alt="Roco AI Logo" width={28} height={28} className="rounded-md" priority />
              <span className="font-bold text-lg tracking-tight group-hover:text-blue-500 transition-colors">Roco Smart AI</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-yellow-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-1.591l-1.591-1.591M5.25 12H3m.386-6.364l-1.591-1.591M12 6.75a5.25 5.25 0 11-5.25 5.25A5.25 5.25 0 0112 6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.75A9.753 9.753 0 003 12c0 5.385 4.365 9.75 9.75 9.75 2.25 0 4.364-.386 6.002-.748v.002z" />
              </svg>
            )}
            </button>
            <button onClick={openProfileModal} className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-white/20 hover:ring-2 hover:ring-blue-500 transition-all">
              {userProfile?.avatar ? <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" /> : (
                <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-white/10 text-white" : "bg-slate-200 text-slate-500"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {chatLog.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl border shadow-lg ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{userProfile ? `Hi, ${userProfile.name}!` : "Selamat Datang!"}</h2>
                  <p className={`text-lg font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{randomOpening}</p>
                </div>
                <div className="w-full">
                  {InputBox()}
                  <div className="flex justify-center mt-4 gap-2">
                    <button onClick={() => setInput("Berita teknologi hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Teknologi</button>
                    <button onClick={() => setInput("Berita pasar hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Pasar</button>
                    <button onClick={() => setInput("Berita politik hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Politik</button>
                    <button onClick={() => setInput("Aku ingin belajar hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Belajar</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full p-4 space-y-8 pb-32">
              {chatLog.map((chat, i) => (
                <div key={i} className={`flex gap-3 md:gap-4 group ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-[10px] font-bold shadow-sm overflow-hidden
                    ${chat.role === "user"
                        ? (isDarkMode ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900")
                        : (isDarkMode ? "border-white/10" : "border-slate-200")}`}>
                    {chat.role === "user" ? (
                      userProfile?.avatar ? <img src={userProfile.avatar} alt="Me" className="w-full h-full object-cover" /> : "U"
                    ) : (
                      <Image src="/logo.png" alt="Roco AI" width={32} height={32} className="object-cover" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-[88%] md:max-w-[85%]">
                    <div className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${chat.role === "user" ? (isDarkMode ? "bg-[#2f2f2f]" : "bg-white border border-slate-100 shadow-sm") : ""}`}>
                      <div className={`prose prose-sm md:prose-base max-w-full overflow-hidden break-words ${isDarkMode ? "prose-invert" : "prose-slate"}`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, children, ...props }) => {
                              const href = props.href || "";
                              const childText = String(children);
                              if (href.includes("youtube.com/watch?v=") && childText.includes("[PLAY_YOUTUBE")) return null;
                              return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{children}</a>;
                            },
                            code: (props) => <CodeBlock {...props} dark={isDarkMode} />,
                            p: ({ node, children }) => {
                              const content = React.Children.toArray(children).reduce((acc: string, child) => {
                                if (typeof child === 'string') return acc + child;
                                if (React.isValidElement(child) && (child.props as any).children) return acc + String((child.props as any).children);
                                return acc;
                              }, "");
                              const youtubeRegex = /\[PLAY_YOUTUBE:\s*https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})[^\s\]]*\]/i;
                              const match = content.match(youtubeRegex);
                              if (match) {
                                const videoId = match[1];
                                const cleanText = content.replace(youtubeRegex, '').trim();
                                return (
                                  <div className="flex flex-col gap-3 my-2">
                                    {cleanText && <p>{cleanText}</p>}
                                    <div className="w-full max-w-full overflow-hidden rounded-xl shadow-lg border border-white/10">
                                      <YouTubePlayer videoId={videoId} />
                                    </div>
                                  </div>
                                );
                              }
                              return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
                            },
                          }}
                        >
                          {chat.role === "ai" ? (displayedMessages[i] || chat.content) : chat.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {interruptedIndex === i && (
                      <div className="text-[10px] text-white-400/80 font-medium italic px-1">
                        Interrupted
                      </div>
                    )}

                    <div className={`flex items-center gap-4 px-1 ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <button onClick={() => { navigator.clipboard.writeText(chat.content); setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 1000); }} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors p-1">
                        {copiedIndex === i ? <span className="text-[10px] font-bold text-blue-500">Copied!</span> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>}
                      </button>
                      {chat.role === "user" && <button onClick={() => { setEditingIndex(i); setInput(chat.content); textareaRef.current?.focus(); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && !isTyping && <div className="flex gap-2 items-center text-[11px] text-slate-500 animate-pulse ml-11"><div className={`w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin`}></div><span>Roco sedang mengetik...</span></div>}
              <div ref={chatEndRef} />
            </div>
          )}
        </main>

        {chatLog.length > 0 && (
          <div className={`p-4 border-t z-20 ${isDarkMode ? "bg-[#171717] border-white/5" : "bg-white border-slate-100"}`}>
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              {InputBox()}
              {editingIndex !== null && (
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] text-blue-500 font-bold italic uppercase tracking-wider">Mode Edit Aktif</p>
                  <button onClick={() => { setEditingIndex(null); setInput(""); if(textareaRef.current) textareaRef.current.style.height="auto"; }} className="text-[10px] text-red-500 hover:underline font-bold">Batal Edit</button>
                </div>
              )}
              <p className="text-[10px] text-center text-slate-500 font-medium tracking-tight mt-1 opacity-70">Roco AI v.1.1.5 — Roco can make mistakes.</p>
            </div>
          </div>
        )}

        {/* MODAL SYSTEM & PROFILE sama seperti sebelumnya – tidak ada perubahan */}
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-in fade-in zoom-in duration-200 ${isDarkMode ? "bg-[#252525] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
              <h3 className="text-lg font-bold mb-2">{modalConfig.type === "rename" ? "Rename Chat" : modalConfig.type === "delete" ? "Delete Chat" : "Hapus semua History"}</h3>
              <p className="text-sm text-slate-500 mb-6">{modalConfig.type === "rename" ? "Ganti nama sesi riset ini." : modalConfig.type === "delete" ? "Yakin ingin menghapus sesi ini?" : "Hapus semua history?"}</p>
              {modalConfig.type === "rename" && <input autoFocus className={`w-full p-3 rounded-xl border mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} value={modalConfig.value} onChange={(e) => setModalConfig({ ...modalConfig, value: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleRenameAction()} />}
              <div className="flex gap-3 justify-end">
                <button onClick={closeModal} className="px-4 py-2 text-sm">Batal</button>
                <button onClick={modalConfig.type === "rename" ? handleRenameAction : modalConfig.type === "delete" ? handleDeleteAction : handleClearAllAction} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${modalConfig.type === "rename" ? "bg-blue-600" : "bg-red-600"}`}>Konfirmasi</button>
              </div>
            </div>
          </div>
        )}

        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-in fade-in zoom-in duration-200 ${isDarkMode ? "bg-[#252525] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
              <h3 className="text-lg font-bold mb-4">{userProfile ? "Edit Profil" : "Buat Profil Baru"}</h3>
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-white/5 transition-all overflow-hidden group"
                  >
                    {tempProfileAvatar ? (
                      <img src={tempProfileAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto mb-1 text-slate-500"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        <span className="text-[9px] uppercase font-bold text-slate-500">Upload</span>
                      </div>
                    )}
                    {tempProfileAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-bold">Ganti Foto</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  {tempProfileAvatar && (
                    <button onClick={handleRemovePhoto} className="text-[10px] text-red-500 hover:underline">Hapus Foto</button>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 block">Nama Panggilan</label>
                  <input
                    className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                    placeholder="Contoh: John Doe"
                    value={tempProfileName}
                    onChange={(e) => setTempProfileName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300">Batal</button>
                <button onClick={handleSaveProfile} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors">Simpan Profile</button>
              </div>
            </div>
          </div>
        )}

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
          @keyframes dropdownOpen { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-in { animation: fadeIn 0.3s ease-out; }
          .zoom-in { animation: zoomIn 0.2s ease-out; }
          .slide-in-from-bottom-4 { animation: slideUp 0.5s ease-out; }
          .animate-dropdownOpen { animation: dropdownOpen 0.2s ease-out; }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `}</style>
      </div>
    </div>
  );
}
