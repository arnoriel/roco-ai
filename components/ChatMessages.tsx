// File: components/ChatMessages.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import YouTubePlayer from "./YouTubePlayer";
import { ChatSession } from "../types";

interface ChatMessagesProps {
  chatLog: ChatSession["messages"];
  isDarkMode: boolean;
  userProfile: any;
  displayedMessages: { [key: number]: string };
  interruptedIndex: number | null;
  copiedIndex: number | null;
  setCopiedIndex: (index: number | null) => void;
  setEditingIndex: (index: number | null) => void;
  setInput: (input: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement| null>;
  isLoading: boolean;
  isTyping: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  chatLog,
  isDarkMode,
  userProfile,
  displayedMessages,
  interruptedIndex,
  copiedIndex,
  setCopiedIndex,
  setEditingIndex,
  setInput,
  textareaRef,
  isLoading,          // ← tambahkan prop ini
  isTyping,
}) => {
  return (
    <div className="max-w-3xl mx-auto w-full p-4 space-y-8 pb-32">
      {chatLog.map((chat, i) => (
        <div key={i} className={`flex gap-3 md:gap-4 group ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-[10px] font-bold shadow-sm overflow-hidden
            ${chat.role === "user"
                ? (isDarkMode ? "bg-white text-black border-white" : "bg-slate-900 text-white border-slate-900")
                : (isDarkMode ? "border-white/10" : "border-slate-200")}`}>
            {chat.role === "user" ? (
              userProfile?.avatar ? <img src={userProfile.avatar} alt="Me" className="w-full h-full object-cover" /> : "U"
            ) : (
              <Image src="/logo.png" alt="Roco AI" width={32} height={32} className="object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-w-[88%] md:max-w-[85%]">
            <div className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed ${chat.role === "user" ? (isDarkMode ? "bg-[#2f2f2f]" : "bg-white border border-slate-100 shadow-sm") : ""}`}>
              <div className={`prose prose-sm md:prose-base max-w-full overflow-hidden break-words ${isDarkMode ? "prose-invert" : "prose-slate"}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, children, ...props }) => {
                      const href = props.href || "";
                      const childText = String(children);
                      if (href.includes("youtube.com/watch?v=") && childText.includes("[PLAY_YOUTUBE")) return null;
                      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{children}</a>;
                    },
                    code: (props) => <CodeBlock {...props} dark={isDarkMode} />,
                    p: ({ node, children }) => {
                      const content = React.Children.toArray(children).reduce((acc: string, child) => {
                        if (typeof child === 'string') return acc + child;
                        if (React.isValidElement(child) && (child.props as any).children) return acc + String((child.props as any).children);
                        return acc;
                      }, "");
                      const youtubeRegex = /\[PLAY_YOUTUBE:\s*https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})[^\s\]]*\]/i;
                      const match = content.match(youtubeRegex);
                      if (match) {
                        const videoId = match[1];
                        const cleanText = content.replace(youtubeRegex, '').trim();
                        return (
                          <div className="flex flex-col gap-3 my-2">
                            {cleanText && <p>{cleanText}</p>}
                            <div className="w-full max-w-full overflow-hidden rounded-xl shadow-lg border border-white/10">
                              <YouTubePlayer videoId={videoId} />
                            </div>
                          </div>
                        );
                      }
                      return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
                    },
                  }}
                >
                  {chat.role === "ai" ? (displayedMessages[i] || chat.content) : chat.content}
                </ReactMarkdown>
              </div>
            </div>

            {interruptedIndex === i && (
              <div className="text-[10px] text-white-400/80 font-medium italic px-1">
                Interrupted
              </div>
            )}

            <div className={`flex items-center gap-4 px-1 ${chat.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <button onClick={() => { navigator.clipboard.writeText(chat.content); setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 1000); }} className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors p-1">
                {copiedIndex === i ? <span className="text-[10px] font-bold text-blue-500">Copied!</span> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" /></svg>}
              </button>
              {chat.role === "user" && <button onClick={() => { setEditingIndex(i); setInput(chat.content); textareaRef.current?.focus(); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg></button>}
            </div>
          </div>
        </div>
      ))}
      {/* Loading indicator sebagai "message" AI yang sedang mengetik */}
      {isLoading && !isTyping && (
        <div className="flex gap-3 md:gap-4">
          {/* Avatar Roco */}
          <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border text-[10px] font-bold shadow-sm overflow-hidden border-white/10`}>
            <Image src="/logo.png" alt="Roco AI" width={32} height={32} className="object-cover" />
          </div>

          {/* Bubble loading */}
          <div className="flex flex-col gap-1.5 max-w-[88%] md:max-w-[85%]">
            <div className={`px-4 py-2.5 rounded-2xl text-[14.5px] leading-relaxed bg-[#2f2f2f]`}>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px]">Roco sedang mengetik...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;