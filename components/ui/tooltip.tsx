"use client";

import { useState } from "react";

interface TooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center ${className ?? ""}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible((v) => !v)}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold cursor-help hover:bg-slate-600 hover:text-slate-300 transition-colors ml-1">
        ?
      </span>
      {isVisible && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed shadow-lg">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-700 transform rotate-45 -mt-1" />
        </span>
      )}
    </span>
  );
}
