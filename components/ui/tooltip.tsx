"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"above" | "below">("above");
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // If not enough space above (tooltip ~80px + 8px margin), show below
    setPosition(rect.top < 100 ? "below" : "above");
  }, []);

  useEffect(() => {
    if (isVisible) updatePosition();
  }, [isVisible, updatePosition]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsVisible((v) => !v);
    } else if (e.key === "Escape") {
      setIsVisible(false);
    }
  };

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex items-center ${className ?? ""}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible((v) => !v)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="More info"
      aria-expanded={isVisible}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] font-bold cursor-help hover:bg-slate-600 hover:text-slate-300 transition-colors ml-1" aria-hidden="true">
        ?
      </span>
      {isVisible && (
        <span
          role="tooltip"
          className={`absolute z-50 left-1/2 -translate-x-1/2 w-56 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed shadow-lg max-w-[calc(100vw-2rem)] ${
            position === "above" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {text}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-slate-700 transform rotate-45 ${
              position === "above"
                ? "top-full border-r border-b -mt-1"
                : "bottom-full border-l border-t -mb-1"
            }`}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
}
