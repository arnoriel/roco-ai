// File: components/ProfileModal.tsx
import React from "react";

interface ProfileModalProps {
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isDarkMode: boolean;
  tempProfileName: string;
  setTempProfileName: (name: string) => void;
  tempProfileAvatar: string;
  setTempProfileAvatar: (avatar: string) => void;
  handleSaveProfile: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePhoto: () => void;
  fileInputRef: React.RefObject<HTMLInputElement| null>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isProfileModalOpen,
  setIsProfileModalOpen,
  isDarkMode,
  tempProfileName,
  setTempProfileName,
  tempProfileAvatar,
  setTempProfileAvatar,
  handleSaveProfile,
  handleFileChange,
  handleRemovePhoto,
  fileInputRef,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl border p-6 animate-in fade-in zoom-in duration-200 ${isDarkMode ? "bg-[#252525] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <h3 className="text-lg font-bold mb-4">{tempProfileName ? "Edit Profil" : "Buat Profil Baru"}</h3>
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
  );
};

export default ProfileModal;