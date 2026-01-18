import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChatSession, UserProfile } from "../types";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatMessages from "../components/ChatMessages";
import InputBox from "../components/InputBox";
import ConfirmationModal from "../components/ConfirmationModal";
import ProfileModal from "../components/ProfileModal";
import WelcomeScreen from "../components/WelcomeScreen";

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

  // --- STATE LOKASI ---
  const [userLocation, setUserLocation] = useState<string | null>(null);

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

  // Logic Geolocation (Dijalankan setiap refresh/load)
  useEffect(() => {
    const fetchLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Reverse Geocoding menggunakan Nominatim (OpenStreetMap)
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              const data = await response.json();
              if (data && data.display_name) {
                setUserLocation(data.display_name);
              } else {
                setUserLocation(`Koordinat: ${latitude}, ${longitude}`);
              }
            } catch (err) {
              console.error("Gagal reverse geocoding:", err);
              setUserLocation(`Koordinat: ${latitude}, ${longitude}`);
            }
          },
          (err) => {
            console.warn("Izin lokasi ditolak atau error:", err.message);
            setUserLocation("Lokasi tidak diizinkan oleh user.");
          },
          { enableHighAccuracy: true }
        );
      }
    };
    fetchLocation();
  }, []);

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
          mode: selectedMode,
          userLocation: userLocation || "Sedang mencari lokasi..."
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
      }, 5);

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

  return (
    <div className={`h-screen flex overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-[#171717] text-white" : "bg-white text-slate-900"}`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isDarkMode={isDarkMode}
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        createNewChat={createNewChat}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        setModalConfig={setModalConfig}
        menuRef={menuRef}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          userProfile={userProfile}
          openProfileModal={openProfileModal}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {chatLog.length === 0 ? (
            <WelcomeScreen
              userProfile={userProfile}
              randomOpening={randomOpening}
              isDarkMode={isDarkMode}
              input={input}
              setInput={setInput}
              isTyping={isTyping}
              isLoading={isLoading}
              editingIndex={editingIndex}
              selectedMode={selectedMode}
              setSelectedMode={setSelectedMode}
              handleSend={handleSend}
              handleInterrupt={handleInterrupt}
              textareaRef={textareaRef}
            />
          ) : (
            <>
              <ChatMessages
                chatLog={chatLog}
                isDarkMode={isDarkMode}
                userProfile={userProfile}
                displayedMessages={displayedMessages}
                interruptedIndex={interruptedIndex}
                copiedIndex={copiedIndex}
                setCopiedIndex={setCopiedIndex}
                setEditingIndex={setEditingIndex}
                setInput={setInput}
                textareaRef={textareaRef}
                isLoading={isLoading}
                isTyping={isTyping}
              />
              <div ref={chatEndRef} />
            </>
          )}
        </main>

        {chatLog.length > 0 && (
          <div className={`p-4 border-t z-20 ${isDarkMode ? "bg-[#171717] border-white/5" : "bg-white border-slate-100"}`}>
            <div className="max-w-3xl mx-auto flex flex-col gap-2">
              <InputBox
                input={input}
                setInput={setInput}
                isDarkMode={isDarkMode}
                isTyping={isTyping}
                isLoading={isLoading}
                editingIndex={editingIndex}
                userProfile={userProfile}
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
                handleSend={handleSend}
                handleInterrupt={handleInterrupt}
                textareaRef={textareaRef}
              />
              {editingIndex !== null && (
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] text-blue-500 font-bold italic uppercase tracking-wider">Mode Edit Aktif</p>
                  <button onClick={() => { setEditingIndex(null); setInput(""); if(textareaRef.current) textareaRef.current.style.height="auto"; }} className="text-[10px] text-red-500 hover:underline font-bold">Batal Edit</button>
                </div>
              )}
              <p className="text-[10px] text-center text-slate-500 font-medium tracking-tight mt-1 opacity-70">Roco AI v.1.1.6 — Roco can make mistakes.</p>
            </div>
          </div>
        )}

        {modalConfig.isOpen && (
          <ConfirmationModal
            modalConfig={modalConfig}
            setModalConfig={setModalConfig}
            isDarkMode={isDarkMode}
            handleRenameAction={handleRenameAction}
            handleDeleteAction={handleDeleteAction}
            handleClearAllAction={handleClearAllAction}
            closeModal={closeModal}
          />
        )}

        {isProfileModalOpen && (
          <ProfileModal
            isProfileModalOpen={isProfileModalOpen}
            setIsProfileModalOpen={setIsProfileModalOpen}
            isDarkMode={isDarkMode}
            tempProfileName={tempProfileName}
            setTempProfileName={setTempProfileName}
            tempProfileAvatar={tempProfileAvatar}
            setTempProfileAvatar={setTempProfileAvatar}
            handleSaveProfile={handleSaveProfile}
            handleFileChange={handleFileChange}
            handleRemovePhoto={handleRemovePhoto}
            fileInputRef={fileInputRef}
          />
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
