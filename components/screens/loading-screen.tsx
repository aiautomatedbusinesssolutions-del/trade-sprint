"use client";

import { useEffect, useState } from "react";

const tips = [
  "The S&P 500 has returned about 10% per year on average.",
  "Diversifying means not putting all your eggs in one basket.",
  "Even pros can't predict the market perfectly — focus on learning!",
  "Warren Buffett says: be fearful when others are greedy.",
  "Selling too early is just as common as holding too long.",
  "The best traders learn from losses, not just wins.",
  "Dollar-cost averaging means investing the same amount regularly.",
  "Markets tend to go up over long periods of time.",
];

export function LoadingScreen() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">
            Preparing Your Market
          </h2>
          <p className="text-sm text-slate-400">
            Setting up stocks and historical data...
          </p>
        </div>

        {/* Rotating tip */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
            Did you know?
          </p>
          <p className="text-sm text-slate-300 transition-opacity duration-300">
            {tips[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
