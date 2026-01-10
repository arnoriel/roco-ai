// File: components/Navbar.tsx
import React from "react";
import Image from "next/image";

interface NavbarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (mode: boolean) => void;
  userProfile: any;
  openProfileModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isDarkMode,
  setIsDarkMode,
  userProfile,
  openProfileModal,
}) => {
  return (
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
  );
};

export default Navbar;