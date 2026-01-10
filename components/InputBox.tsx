// File: components/InputBox.tsx
import React from "react";
import ModeDropdown from "./ModeDropdown";

interface InputBoxProps {
  input: string;
  setInput: (input: string) => void;
  isDarkMode: boolean;
  isTyping: boolean;
  isLoading: boolean;
  editingIndex: number | null;
  userProfile: any;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  handleSend: (overrideInput?: string, isEdit?: boolean, index?: number) => void;
  handleInterrupt: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement| null>;
}

const InputBox: React.FC<InputBoxProps> = ({
  input,
  setInput,
  isDarkMode,
  isTyping,
  isLoading,
  editingIndex,
  userProfile,
  selectedMode,
  setSelectedMode,
  handleSend,
  handleInterrupt,
  textareaRef,
}) => {
  return (
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
};

export default InputBox;