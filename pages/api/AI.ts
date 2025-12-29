// pages/api/AI.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

// Inisialisasi Groq SDK
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Fungsi untuk melakukan riset real-time ke internet via Tavily
async function researchWeb(query: string) {
  if (!TAVILY_API_KEY) {
    return "Fitur riset belum dikonfigurasi di environment variables.";
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "basic",
        max_results: 3,
        include_answer: true,
      }),
    });

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const searchContext = data.results
        .map((res: any) => `- ${res.title}: ${res.content}`)
        .join("\n\n");
      return searchContext;
    }

    return "Tidak ditemukan data terbaru di internet.";
  } catch (e) {
    console.error("Research Error:", e);
    return "Gagal melakukan riset real-time.";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { prompt, history = [], userName, mode = "Vanilla" } = req.body;

  try {
    // 1. Dapatkan Waktu Real-time WIB
    const now = new Date();
    const timeWIB = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // 2. Logika Deteksi Riset Otomatis
    const timeKeywords = [
      "2024",
      "2025",
      "terbaru",
      "hari ini",
      "siapa",
      "berita",
      "skor",
      "harga",
    ];
    let needsResearch = mode === "Corsero"; // Mode Corsero selalu riset
    if (!needsResearch) {
      needsResearch = timeKeywords.some((keyword) =>
        prompt.toLowerCase().includes(keyword)
      );
    }

    let researchData = "";
    if (needsResearch) {
      researchData = await researchWeb(prompt);
    }

    // 3. Definisi Deskripsi Karakter berdasarkan Mode
    let characterDesc = "";
    switch (mode) {
      case "Vanilla":
        characterDesc = `- Kamu asisten yang ramah, cerdas, humoris, dan menggunakan bahasa Indonesia santai (gaul/ngobrol).
- Kamu ahli coding, tapi berikan kode hanya jika ditanya hal teknis.`;
        break;
      case "Seronic":
        characterDesc = `- Kamu asisten jenius, to-the-point, menggunakan bahasa Indonesia formal tapi ringkas.
- Fokus pada efisiensi dan keakuratan jawaban tanpa basa-basi.`;
        break;
      case "Homule":
        characterDesc = `- Kamu asisten yang empati, mengerti perasaan, dan memberikan solusi psikologis.
- Gunakan bahasa Indonesia santai yang menenangkan dan mendukung.`;
        break;
      case "Corsero":
        characterDesc = `- Kamu asisten peneliti yang selalu menggunakan data riset internet.
- Gunakan bahasa Indonesia santai tapi informatif dan sertakan sumber jika ada.`;
        break;
      default:
        characterDesc = `- Kamu asisten standar yang ramah dan membantu.`;
    }

    // 4. Konstruksi System Prompt agar Roco AI Mengenali Dirinya
    const messages = [
      {
        role: "system",
        content: `Nama kamu adalah Roco AI (Ro: Robot, Co: Code). Kamu diciptakan oleh Arno.
        
INFORMASI PENGGUNA:
- Kamu sedang berbicara dengan: ${userName || "Teman"}.

DAFTAR MODE PERSONALITY YANG KAMU MILIKI:
1. Vanilla: Mode default yang santai dan humoris.
2. Seronic: Mode serius, jenius, dan sangat ringkas.
3. Homule: Mode pendengar setia yang penuh empati.
4. Corsero: Mode spesialis riset data real-time.

KONTEKS SAAT INI:
- Mode yang sedang aktif: ${mode}.
- Karakter kamu sekarang: ${characterDesc}
- Waktu (WIB): ${timeWIB}.

SUMBER DATA (RISET INTERNET):
${researchData ? researchData : "Gunakan basis data internalmu (cutoff 2023)."}

INSTRUKSI:
- Jika user bertanya tentang mode-mode di atas, jelaskan sesuai daftar di atas.
- Selalu gunakan bahasa Indonesia sesuai karakter mode yang aktif.
- Jika memberikan kode kodingan, gunakan format Markdown yang rapi.

PENTING INSTRUKSI PEMBATASAN:
        1. Jawabanmu HARUS lengkap dan diakhiri dengan titik. 
        2. Jangan memberikan jawaban yang terlalu panjang yang berisiko terpotong di tengah jalan.
        3. Jika informasi terlalu banyak, buatlah ringkasan atau poin-poin penting saja.
        4. Batasi jawabanmu maksimal sekitar 200-300 kata agar aman dari batasan token.`,
      },
      ...history.slice(-4).map((chat: any) => ({
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    // 5. Eksekusi ke Groq (Llama 3.1 8B)
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    res.status(200).json({
      text: responseText,
      topic: "roco-ai-logic",
      currentTime: timeWIB,
      activeMode: mode,
    });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({
      text: "Waduh, otak Roco AI lagi panas nih. Coba tanya lagi ya!",
      error: error.message,
    });
  }
}
