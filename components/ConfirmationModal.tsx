// File: components/ConfirmationModal.tsx
import React from "react";

interface ConfirmationModalProps {
  modalConfig: any;
  setModalConfig: (config: any) => void;
  isDarkMode: boolean;
  handleRenameAction: () => void;
  handleDeleteAction: () => void;
  handleClearAllAction: () => void;
  closeModal: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  modalConfig,
  setModalConfig,
  isDarkMode,
  handleRenameAction,
  handleDeleteAction,
  handleClearAllAction,
  closeModal,
}) => {
  return (
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
  );
};

export default ConfirmationModal;