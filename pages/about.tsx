import { useState, useEffect } from "react";
import Link from "next/link";

export default function About() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
    }
  }, []);

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? "bg-[#171717] text-white" : "bg-white text-slate-900"}`}>
      {/* HEADER */}
      <nav className={`sticky top-0 left-0 right-0 border-b py-3 px-6 flex justify-between items-center z-30 backdrop-blur-md ${isDarkMode ? "border-white/10 bg-[#171717]/90" : "border-slate-200 bg-white/90"}`}>
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="group flex items-center gap-2 outline-none">
              <span className="font-bold text-lg tracking-tight group-hover:text-blue-500 transition-colors">Back to Roco AI</span>
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? "text-yellow-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>{isDarkMode ? "☀️" : "🌙"}</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">About Roco AI</h2>
        
        <section className="mb-8">
          <p className="text-base leading-relaxed mb-4">
            Roco AI adalah asisten AI cerdas yang dirancang untuk membantu pengguna dalam riset, pencarian informasi, dan eksplorasi topik-topik terkini. AI ini menggunakan alur kerja (flow) berbasis model bahasa besar seperti Groq untuk memproses pertanyaan pengguna, menganalisis data, dan memberikan respons yang akurat dan relevan.
          </p>
          <p className="text-base leading-relaxed">
            Flow utama: Pengguna input pertanyaan → AI memproses dengan mode personality yang dipilih → Mengambil data dari API jika diperlukan → Menghasilkan respons yang informatif.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Kelebihan Roco AI</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cepat dan efisien dalam mencari informasi terbaru.</li>
            <li>Mode personality yang customizable untuk pengalaman berbeda (Vanilla, Seronic, dll.).</li>
            <li>Integrasi dengan local storage untuk menyimpan sesi chat dan profile pengguna.</li>
            <li>Dark/light mode untuk kenyamanan visual.</li>
            <li>Dukungan edit pesan dan copy respons untuk fleksibilitas.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Perkenalan Setiap Mode</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium">Vanilla</h3>
              <p>Mode standar yang netral dan langsung ke pokok bahasan. Cocok untuk pertanyaan umum dan riset sederhana.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Seronic</h3>
              <p>Mode serius dan analitis, fokus pada detail mendalam dan penjelasan logis. Ideal untuk topik ilmiah atau bisnis.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Homule</h3>
              <p>Mode humoris dan santai, menambahkan elemen lucu dalam respons. Bagus untuk obrolan ringan atau belajar sambil bersenang-senang.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium">Corsero</h3>
              <p>Mode kreatif dan inspiratif, membantu dalam brainstorming ide atau penulisan kreatif.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pedoman Pengguna</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Gunakan Roco AI untuk tujuan positif seperti belajar, riset, dan informasi.</li>
            <li>Jangan gunakan untuk konten ilegal, berbahaya, atau menyesatkan.</li>
            <li>Verifikasi informasi penting dari sumber terpercaya, karena AI bisa salah.</li>
            <li>Hormati privasi: Jangan bagikan data pribadi sensitif.</li>
            <li>Mode personality bisa diubah kapan saja untuk menyesuaikan gaya respons.</li>
          </ul>
        </section>

        <section id="help" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Help / Bantuan</h2>
          <p className="text-base leading-relaxed mb-4">
            Cara menggunakan Roco AI:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Buat profile di kanan atas untuk personalisasi.</li>
            <li>Pilih mode personality di input box (kiri bawah).</li>
            <li>Ketik pertanyaan dan tekan enter atau tombol kirim.</li>
            <li>Edit pesan user dengan tombol edit, atau salin respons AI.</li>
            <li>Gunakan sidebar untuk history chat, buat chat baru, atau hapus history.</li>
            <li>Ubah tema dark/light di atas kanan.</li>
          </ol>
          <p className="mt-4">Jika ada masalah, hubungi developer di [email/contact].</p>
          <p className="mt-4">Email: azrilluthfimulyadi@gmail.com</p>
          <p className="mt-4">Contact: +62 857-9700-9915</p>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}   