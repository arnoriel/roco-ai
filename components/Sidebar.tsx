// File: components/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { ChatSession } from "../types"; // Asumsi Anda buat file types.ts untuk interface

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewChat: () => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  setModalConfig: (config: any) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isDarkMode,
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewChat,
  activeMenuId,
  setActiveMenuId,
  setModalConfig,
  menuRef,
}) => {
  return (
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
  );
};

export default Sidebar;