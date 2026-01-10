// File: types.ts (Buat file ini untuk interface shared)
export interface UserProfile {
  name: string;
  avatar: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: { role: string; content: string }[];
  createdAt: number;
}