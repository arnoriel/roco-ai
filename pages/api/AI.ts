import type { NextApiRequest, NextApiResponse } from 'next';
import { knowledgeBase } from '../../data/knowledge';
import { MathEvaluator } from '@/utils/advancedLogic';

// Fungsi memotong imbuhan
function simpleStemmer(word: string): string {
  return word
    .toLowerCase()
    .replace(/^(me|pe|be|di|te|ke)(ny|ng|l|r)?/g, '')
    .replace(/(kan|an|i|nya)$/g, '');
}

// Format ke Title Case untuk Wikipedia (Bitcoin, Indonesia, Bumi)
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Fungsi Riset Wikipedia
async function conductResearch(topic: string) {
  if (!topic || topic.length < 2) return null;
  try {
    const cleanTopic = topic.replace(/[?]/g, '').trim();
    const formattedTopic = toTitleCase(cleanTopic);
    const searchUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedTopic)}`;
    
    const res = await fetch(searchUrl);
    if (res.status !== 200) return null;

    const data = await res.json();
    if (data.extract) {
      return `Berdasarkan riset saya: ${data.extract} (Sumber: Wikipedia)`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { prompt, history } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt kosong' });

  const cleanPrompt = prompt.toLowerCase().trim();
  
  // --- 1. LOGIKA MATEMATIKA (High Priority) ---
  const mathExpr = MathEvaluator.findMathExpression(cleanPrompt);
  if (mathExpr && (cleanPrompt.includes("hitung") || cleanPrompt.includes("berapa"))) {
    const result = MathEvaluator.calculate(mathExpr);
    return res.status(200).json({ 
      text: `Berdasarkan perhitungan logika saya, hasil dari ${mathExpr} adalah **${result}**.`, 
      topic: "math" 
    });
  }

  // --- 2. LOGIKA RISET DATA (Wikipedia + Keyword Extraction) ---
  const researchKeywords = ["siapa", "apa itu", "jelaskan", "sejarah", "pengertian", "dimana"];
  const isAskingData = researchKeywords.some(k => cleanPrompt.startsWith(k));

  if (isAskingData) {
    // Ambil subjek setelah kata tanya
    const subject = cleanPrompt.split(" ").slice(2).join(" ");
    if (subject.length > 2) {
      const data = await conductResearch(subject);
      if (data) return res.status(200).json({ text: data, topic: "research" });
    }
  }

  // --- 3. KNOWLEDGE BASE DENGAN WEIGHTED SCORING ---
  const words = cleanPrompt.split(/\s+/);
  let bestMatch = { response: "", score: 0, topic: "" };

  knowledgeBase.forEach((entry) => {
    let currentScore = 0;
    entry.keywords.forEach(kw => {
      if (cleanPrompt.includes(kw)) currentScore += 2; // Exact phrase match
    });

    if (currentScore > bestMatch.score) {
      const randomIndex = Math.floor(Math.random() * entry.responses.length);
      bestMatch = { response: entry.responses[randomIndex], score: currentScore, topic: entry.topic };
    }
  });

  // --- 4. FALLBACK STRATEGY ---
  let finalResponse = bestMatch.response;
  if (bestMatch.score < 1) {
    const wikiFallback = await conductResearch(cleanPrompt);
    finalResponse = wikiFallback || "Maaf, saya tidak menemukan data tersebut di memori lokal maupun database riset saya. Bisa coba tanyakan dengan kata kunci lain?";
  }

  res.status(200).json({ text: finalResponse, topic: bestMatch.topic || "unknown" });
}