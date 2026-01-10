// File: components/ModeDropdown.tsx
import React, { useState, useEffect, useRef } from "react";

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

export default ModeDropdown;