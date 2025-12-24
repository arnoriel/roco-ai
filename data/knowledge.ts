export const knowledgeBase = [
  // --- SOSIAL & GREETING ---
  {
    keywords: [
      "halo",
      "hai",
      "hey",
      "pagi",
      "siang",
      "sore",
      "malam",
      "assalamualaikum",
    ],
    responses: [
      "Halo juga! Senang bisa ngobrol lagi sama kamu.",
      "Hai! Hari ini keliatannya bakal jadi hari yang seru, ya?",
      "Halo! Ada yang bisa saya temani hari ini?",
    ],
    topic: "greeting",
  },
  {
    keywords: ["kabar", "gimana", "sehat", "kamu", "apa kabar"],
    responses: [
      "Saya sebagai kode selalu stabil, kalau kamu sendiri gimana kabarnya?",
      "Kabar baik! Mesin saya berjalan lancar di local storage kamu.",
      "Luar biasa! Siap membantu menjawab pertanyaanmu.",
    ],
    topic: "wellbeing",
  },

  // --- IDENTITAS & EKSISTENSI ---
  {
    keywords: ["siapa", "identitas", "pencipta", "pembuat", "nama"],
    responses: [
      "Saya adalah asisten berbasis Pure Code (Logic-only). Tidak ada cloud, tidak ada LLM, murni logika TypeScript!",
      "Nama saya Mini-AI. Saya tinggal di browser kamu melalui Local Storage.",
      "Saya diciptakan oleh Arno.",
    ],
    topic: "identity",
  },

  // --- EMOSI & CURHAT ---
  {
    keywords: [
      "sedih",
      "galau",
      "capek",
      "lelah",
      "stres",
      "masalah",
      "putus",
      "kecewa",
    ],
    responses: [
      "Dunia kadang emang berat, tapi ingat kalau kamu sudah berjuang sejauh ini. Semangat ya!",
      "Ambil nafas dulu. Kadang istirahat sejenak itu investasi terbaik buat kesehatan mental kamu.",
      "Kalau mau cerita lebih lanjut, saya di sini buat dengerin (meskipun saya cuma sekumpulan kode).",
    ],
    topic: "emotion_support",
  },
  {
    keywords: [
      "senang",
      "bahagia",
      "mantap",
      "keren",
      "berhasil",
      "menang",
      "hore",
    ],
    responses: [
      "Wah, ikut seneng dengernya! Rayakan kemenangan kecilmu hari ini!",
      "Mantap! Pertahankan energi positifnya ya.",
      "Keren banget! Kamu emang luar biasa.",
    ],
    topic: "positive_vibe",
  },

  // --- LOGIKA MAKANAN & GAYA HIDUP ---
  {
    keywords: [
      "makan",
      "lapar",
      "kenyang",
      "haus",
      "minum",
      "rekomendasi",
      "kuliner",
      "jajan",
    ],
    responses: [
      "Coba cari makanan yang berkuah, biasanya bikin mood lebih enak.",
      "Sudah coba Seblak atau Bakso? Kayaknya cocok buat cuaca sekarang.",
      "Jangan lupa minum air putih minimal 2 liter sehari ya supaya tetap fokus.",
    ],
    topic: "food",
  },

  // --- FILOSOFI & TEKNOLOGI ---
  {
    keywords: [
      "ai",
      "robot",
      "pintar",
      "cerdas",
      "teknologi",
      "masa depan",
      "coding",
      "nextjs",
    ],
    responses: [
      "Teknologi itu alat, yang paling penting adalah orang di baliknya. Kayak kamu!",
      "Next.js dan TypeScript itu kombinasi maut buat bikin aplikasi modern. Pilihan yang bagus!",
      "Masa depan AI itu menarik, tapi AI yang murni logika seperti saya punya keunikan tersendiri karena lebih privasi.",
    ],
    topic: "tech",
  },

  // --- KONTEKS SARKAS / BERCANDA ---
  {
    keywords: ["lucu", "lawak", "becanda", "jokes", "ngakak", "garing"],
    responses: [
      "Kenapa komputer kedinginan? Karena dia buka banyak Windows. Hahaha!",
      "Apa bedanya kamu sama modem? Kalau modem terhubung ke internet, kalau kamu terhubung ke hati aku. Eaaa!",
      "Saya AI, nggak punya perasaan, tapi saya tahu kalau jokes tadi agak garing.",
    ],
    topic: "humor",
  },

  // Tambahkan ini di knowledgeBase
  {
    keywords: ["kenapa", "mengapa", "sebab", "alasan"],
    responses: [
      "Karena secara logika, itu yang paling memungkinkan buat kita bahas sekarang.",
      "Aku cuma mengikuti pola kosa kata yang kamu berikan tadi.",
      "Mungkin karena kita sedang membahas topik yang sama sebelumnya?",
    ],
    topic: "logic_inquiry",
  },
  {
    keywords: ["iya", "oke", "siap", "betul", "benar", "sip"],
    responses: [
      "Mantap, senang kita sefrekuensi!",
      "Oke, lanjut! Ada lagi yang mau dibahas?",
      "Siap, aku stand by di sini.",
    ],
    topic: "agreement",
  },

  {
  keywords: ["javascript", "typescript", "react", "nextjs", "coding", "pemrograman"],
  responses: [
    "TypeScript adalah superset dari JavaScript yang menambahkan static typing. Ini membuat kode kamu lebih aman dari bug!",
    "Dalam Next.js, kamu bisa menggunakan SSR (Server Side Rendering) untuk SEO yang lebih baik.",
    "Jangan lupa selalu gunakan 'const' dan 'let' daripada 'var' saat coding modern JavaScript."
  ],
  topic: "programming"
},
{
  keywords: ["algoritma", "logika", "struktur data"],
  responses: [
    "Logika dasar adalah kunci. Apakah kamu sedang mencoba mengoptimalkan Big O Notation pada kodemu?",
    "Struktur data seperti HashMaps (Objects di JS) sangat cepat untuk pencarian data O(1)."
  ],
  topic: "computer_science"
},
{
  keywords: ["cuaca", "hujan", "panas", "matahari"],
  responses: [
    "Saya tidak punya sensor suhu real-time, tapi pastikan kamu sedia payung jika langit mendung.",
    "Ingat untuk tetap terhidrasi jika cuaca di luar sana sedang panas ekstrem!"
  ],
  topic: "environment"
}

  

];
