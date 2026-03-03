"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils/format";
import { TOTAL_MONTHS, STARTING_BALANCE } from "@/lib/constants/tickers";
import { GLOSSARY } from "@/lib/constants/glossary";

export function TopBar() {
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const cashBalance = useSprintStore((s) => s.cashBalance);
  const getPortfolioValue = useSprintStore((s) => s.getPortfolioValue);
  const isMockData = useSprintStore((s) => s.isMockData);

  const totalValue = getPortfolioValue();
  const pnl = totalValue - STARTING_BALANCE;
  const isUp = pnl >= 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      {isMockData && (
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg px-3 py-1.5 text-xs text-amber-400 text-center">
          Using simulated data — real market data unavailable
        </div>
      )}
      {/* Month progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-100">
            Month {currentMonth + 1} of {TOTAL_MONTHS}
          </span>
          <span className="text-xs text-slate-500">
            {TOTAL_MONTHS - currentMonth - 1} months left
          </span>
        </div>
        <ProgressBar value={currentMonth + 1} max={TOTAL_MONTHS} color="sky" />
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-slate-500">Cash <InfoTooltip text={GLOSSARY.cash} /></p>
          <p className="text-sm font-semibold text-slate-100">
            {formatCurrency(cashBalance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Portfolio <InfoTooltip text={GLOSSARY.portfolioValue} /></p>
          <p className="text-sm font-semibold text-slate-100">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">P/L <InfoTooltip text={GLOSSARY.profitLoss} /></p>
          <p
            className={`text-sm font-semibold ${
              isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isUp ? "+" : ""}
            {formatCurrency(pnl)}
          </p>
        </div>
      </div>
    </div>
  );
}
