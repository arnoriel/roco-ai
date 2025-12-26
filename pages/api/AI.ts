// pages/api/AI.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";

// AMAN: Mengambil API Key dari Environment Variables
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Fungsi untuk melakukan riset real-time ke internet
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
      // Menggabungkan ringkasan berita/data dari internet
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

  // FITUR BARU: Ambil userName dari body
  const { prompt, history = [], userName } = req.body;

  try {
    // 1. Dapatkan Waktu Real-time WIB
    const now = new Date();
    const timeWIB = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // 2. Logika Deteksi Riset
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
    const needsResearch = timeKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword)
    );

    let researchData = "";
    if (needsResearch) {
      researchData = await researchWeb(prompt);
    }

    // 3. Siapkan System Prompt
    const messages = [
      {
        role: "system",
        content: `Nama kamu adalah Roco AI (Ro: Robot, Co: Code). Kamu diciptakan oleh Arno.
        
        INFORMASI PENGGUNA:
        - Kamu sedang berbicara dengan pengguna bernama: ${userName || "Teman"}.
        - Sapa dia dengan namanya sesekali agar terasa personal, tapi jangan berlebihan.
        
        KARAKTER:
        - Kamu asisten yang ramah, cerdas, humoris, dan menggunakan bahasa Indonesia santai (gaul/ngobrol).
        - Kamu ahli pemrograman (coding), tapi HANYA berikan kode jika user bertanya tentang teknis, error, atau meminta contoh kodingan. 
        - Jika pertanyaan umum, jawablah dengan teks penjelasan yang santai tanpa kode.
        
        KONTEKS WAKTU:
        - Waktu sekarang (WIB): ${timeWIB}.
        
        PENGETAHUAN TERBARU (HASIL RISET INTERNET):
        ${
          researchData
            ? researchData
            : "Gunakan basis data internalmu (cutoff 2023)."
        }
        
        INSTRUKSI KHUSUS:
        - Gunakan data HASIL RISET untuk menjawab pertanyaan tentang peristiwa tahun 2024-2025.
        - Jika memberikan kode, gunakan format Markdown yang rapi.
        - Selalu ingat konteks percakapan sebelumnya.`,
      },
      // Ambil 3-5 percakapan terakhir agar memori tetap ada tapi token irit
      ...history.slice(-3).map((chat: any) => ({
        role: chat.role === "user" ? "user" : "assistant",
        content: chat.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    // 4. Kirim ke model yang lebih ringan (Llama 3.1 8B)
    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";

    // 5. Kirim Respon ke Frontend
    res.status(200).json({
      text: responseText,
      topic: "roco-ai-logic",
      currentTime: timeWIB,
    });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({
      text: "Waduh, otak Roco AI lagi panas nih. Coba tanya lagi ya!",
      error: error.message,
    });
  }
}
