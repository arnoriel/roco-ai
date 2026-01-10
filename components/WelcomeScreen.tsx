// File: components/WelcomeScreen.tsx
import React from "react";
import Image from "next/image";
import InputBox from "./InputBox";

interface WelcomeScreenProps {
  userProfile: any;
  randomOpening: string;
  isDarkMode: boolean;
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  isLoading: boolean;
  editingIndex: number | null;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  handleSend: (overrideInput?: string, isEdit?: boolean, index?: number) => void;
  handleInterrupt: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userProfile,
  randomOpening,
  isDarkMode,
  input,
  setInput,
  isTyping,
  isLoading,
  editingIndex,
  selectedMode,
  setSelectedMode,
  handleSend,
  handleInterrupt,
  textareaRef,
}) => {
  return (
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
          <div className="flex justify-center mt-4 gap-2">
            <button onClick={() => setInput("Berita teknologi hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Teknologi</button>
            <button onClick={() => setInput("Berita pasar hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Pasar</button>
            <button onClick={() => setInput("Berita politik hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Berita Politik</button>
            <button onClick={() => setInput("Aku ingin belajar hari ini")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isDarkMode ? "border-white/10 hover:bg-white/10 text-slate-400" : "border-slate-200 hover:bg-slate-50 text-slate-500"}`}>Belajar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;