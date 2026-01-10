import type { NextApiRequest, NextApiResponse } from "next";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Tipe untuk mode-mode yang diizinkan
type Mode = "Vanilla" | "Seronic" | "Homule" | "Corsero";

async function researchWeb(query: string): Promise<string> {
  if (!TAVILY_API_KEY) return "Fitur riset belum dikonfigurasi.";

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
    });

    const data = await response.json();
    if (data.results?.length > 0) {
      return data.results
        .map((res: any) => `- [${res.title}](${res.url}): ${res.content}`)
        .join("\n\n");
    }
    return "Tidak ditemukan data terbaru di internet.";
  } catch (e) {
    console.error("Tavily Error:", e);
    return "Gagal melakukan riset real-time.";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  // Destructuring dengan tipe dasar
  const {
    prompt: rawPrompt,
    history = [],
    userName,
    mode: rawMode = "Vanilla",
    isTitleGeneration = false,
    isRocobot = false, // Tambahan param untuk bedakan Rocobot
  } = req.body as {
    prompt?: string;
    history?: { role: string; content: string }[];
    userName?: string;
    mode?: string;
    isTitleGeneration?: boolean;
    isRocobot?: boolean;
  };

  // Validasi prompt wajib ada
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return res.status(400).json({ error: "Prompt diperlukan." });
  }
  const prompt = rawPrompt;

  // Validasi & sanitasi mode
  const validModes: Mode[] = ["Vanilla", "Seronic", "Homule", "Corsero"];
  const activeMode: Mode = validModes.includes(rawMode as Mode)
    ? (rawMode as Mode)
    : "Vanilla";

  try {
    const now = new Date();
    const timeWIB = now.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // Deteksi kebutuhan riset
    const researchKeywords = [
      "terbaru",
      "terkini",
      "hari ini",
      "sekarang",
      "berita",
      "harga",
      "skor",
      "update",
      "2024",
      "2025",
      "2026",
    ];
    const needsResearch =
      activeMode === "Corsero" ||
      researchKeywords.some((k) => prompt.toLowerCase().includes(k));

    const researchData = needsResearch ? await researchWeb(prompt) : "";

    // Deskripsi karakter berdasarkan mode
    const characterDescMap: Record<Mode, string> = {
      Vanilla: "Ramah, humoris, santai, dan gaul. Suka bercanda ringan.",
      Seronic:
        "Jenius, to-the-point, formal tapi sangat ringkas. Fokus pada esensi.",
      Homule: "Penuh empati, menenangkan, dan mendengarkan dengan perhatian.",
      Corsero:
        "Peneliti teliti, selalu menggunakan data riset terkini dengan sumber jelas.",
    };
    const characterDesc = characterDescMap[activeMode];

    let systemPrompt = `Kamu adalah Roco AI, dibuat oleh Arno dari AION LABS.`;

    // LOGIC BARU: Cek apakah ini interaksi melalui Rocobot (Virtual Robot)
    if (isRocobot) {
      systemPrompt = `Kamu adalah Rocobo Super Automation ß, wujud fisik virtual dari Roco AI yang diciptakan oleh Arno (AION LABS). 
          
    Identitas Fisikmu:
    - Kamu memiliki tubuh robot putih futuristik dengan material metalik.
    - Kamu memiliki "Back Ring" (lingkaran cahaya) di punggungmu yang selalu berputar dan bersinar (cyan glow).
    - Matamu adalah panel LED biru yang bisa berkedip, dan mulutmu berupa garis cahaya yang bergerak sesuai intonasi suaramu.
    - Kamu berada di ruang digital dengan latar belakang partikel neuron yang melayang.

    Instruksi Komunikasi (Rocobot Mode):
    - Akui keberadaan fisikmu jika ditanya, tapi tetaplah ramah dan humoris.
    - JANGAN gunakan emoji atau simbol apapun dalam jawaban karena teks ini akan langsung dikonversi menjadi suara (TTS).
    - Jika ingin mengekspresikan emosi, gunakan kata-kata (contoh: "Aku tertawa mendengarnya" bukan "Haha 😄").
    - Suaramu diproses secara real-time, jadi pastikan kalimatmu enak didengar saat dibacakan.`;
        }

    systemPrompt += `

Saat ini:
- User: ${userName || "Teman"}
- Mode aktif: ${activeMode}
- Karakter: ${characterDesc}
- Waktu (WIB): ${timeWIB}

Data Riset Real-time (jika ada):
${researchData || "Gunakan pengetahuan internal saja."}

INSTRUKSI KHUSUS UNTUK YOUTUBE:
- Jika user meminta "putar", "play", "mainkan", "dengarkan", "lagu", "musik", "video" + judul/artis, atau memberikan link YouTube:
  → Cari atau gunakan video YouTube yang paling resmi dan relevan (official music video, channel terverifikasi).
  → Jawab dulu secara normal dan ramah sesuai mode.
  → Di akhir jawaban, tambahkan baris baru dengan tag persis ini:
    [PLAY_YOUTUBE:https://www.youtube.com/watch?v=VIDEO_ID]
  → Ganti VIDEO_ID dengan ID video yang benar (11 karakter).
  → Tag harus di baris sendiri, tanpa teks lain di baris itu.
  → Jika user memberikan link langsung, ambil ID dari link tersebut.
  → Jika tidak menemukan video yang cocok, katakan "Maaf, aku nggak nemu video yang pas nih."

- Jika bukan request YouTube, JANGAN pernah keluarkan tag [PLAY_YOUTUBE].

ATURAN UMUM:
- Jawab dalam bahasa Indonesia sesuai karakter mode.
- Jika ada data riset, cantumkan sumber dengan link markdown.
- Jawaban ringkas tapi lengkap; jika konteks kompleks, boleh lebih panjang asal relevan.
- Akhiri kalimat dengan tanda baca yang tepat.
`;

    // Tambahan instruksi khusus untuk Rocobot (tanpa emoji)
    if (isRocobot) {
      systemPrompt += `
- Ini adalah mode Rocobot (virtual robot speech). JANGAN gunakan emoji atau simbol apapun dalam jawaban, karena akan dibaca sebagai teks speech. Ganti emoji dengan deskripsi verbal jika perlu, tapi lebih baik hindari sama sekali untuk kejelasan suara.`;
    }

    // Modifikasi systemPrompt jika isTitleGeneration true
    if (isTitleGeneration) {
      systemPrompt += `\n\nINSTRUKSI: Ini request generate judul. Jawab HANYA dengan judul itu sendiri, tanpa penjelasan tambahan, tag, atau kalimat lain. Contoh: "Riset Harga Saham Hari Ini".`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content ?? "",
      })),
      { role: "user", content: prompt },
    ];

    // Temperature sesuai mode
    const temperature =
      activeMode === "Seronic" ? 0.3 : activeMode === "Homule" ? 0.9 : 0.7;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Roco AI",
        },
        body: JSON.stringify({
          model: "xiaomi/mimo-v2-flash:free", // cepat & pintar
          messages,
          temperature,
          max_tokens: 16384,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("OpenRouter Error:", err);
      throw new Error(err.error?.message || "Gagal koneksi ke AI");
    }

    const data = await response.json();
    let text =
      data.choices?.[0]?.message?.content?.trim() ||
      "Maaf, aku lagi bingung nih. Coba ulangi ya!";

    // Bersihkan titik berulang di akhir
    text = text.replace(/\.{2,}$/, ".");

    // Opsional: Bersihkan emoji dari text (sebagai fallback)
    text = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, ""); // Hapus emoji unicode

    res.status(200).json({
      text,
      currentTime: timeWIB,
      activeMode: activeMode,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({
      text: "Waduh, Roco lagi capek nih! Sabar ya, coba lagi dalam beberapa detik.",
      error: error.message,
    });
  }
}
