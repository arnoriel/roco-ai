// File: components/CodeBlock.tsx
import React, { useState } from "react";

const CodeBlock = ({ node, inline, className, children, dark, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");
  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (!inline && match) {
    return (
      <div className={`my-4 rounded-xl overflow-hidden border shadow-sm group/code relative
        ${dark ? "bg-[#0d0d0d] border-white/10" : "bg-slate-900 border-slate-200"}`}>
        <div className={`flex items-center justify-between px-4 py-2 border-b
          ${dark ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5"}`}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{match[1]}</span>
          <button onClick={handleCopy} className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <div className="p-4 overflow-x-auto custom-scrollbar">
          <code className="text-sm font-mono leading-relaxed text-slate-100" {...props}>{children}</code>
        </div>
      </div>
    );
  }
  return (
    <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${dark ? "bg-white/10 text-pink-400" : "bg-slate-100 text-pink-600"}`} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;