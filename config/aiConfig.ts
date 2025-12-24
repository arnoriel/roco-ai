export const aiConfig = {
  // Personality settings
  personalities: {
    friendly: {
      greetings: ["Halo!", "Hai!", "Halo teman!"],
      farewells: ["Sampai jumpa!", "Selamat tinggal!"],
      fillers: ["Wah", "Nah", "Oke", "Jadi"]
    },
    formal: {
      greetings: ["Selamat datang", "Hormat saya"],
      farewells: ["Terima kasih", "Sampai bertemu lagi"],
      fillers: ["Baiklah", "Selanjutnya", "Kemudian"]
    },
    casual: {
      greetings: ["Yo!", "Hey bro!"],
      farewells: ["See ya!", "Bye!"],
      fillers: ["Gitu loh", "Yah", "Oke deh"]
    },
    professional: {
      greetings: ["Selamat datang", "Apa yang bisa saya bantu?"],
      farewells: ["Terima kasih atas waktunya", "Sampai jumpa"],
      fillers: ["Selanjutnya", "Dalam hal ini"]
    }
  },
  
  // Response settings
  responseSettings: {
    maxLength: 500,
    minConfidence: 0.3,
    enableEmojis: true,
    enableMarkdown: true
  },
  
  // Memory settings
  memorySettings: {
    maxConversationHistory: 50,
    enableLongTermMemory: true,
    cleanupInterval: 3600000 // 1 hour
  },
  
  // Feature toggles
  features: {
    enableMath: true,
    enableResearch: true,
    enableMemory: true,
    enableLearning: true
  }
};