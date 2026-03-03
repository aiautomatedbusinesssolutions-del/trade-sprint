"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatCurrency, formatPercent, formatShares } from "@/lib/utils/format";
import { STARTING_BALANCE } from "@/lib/constants/tickers";
import { GLOSSARY } from "@/lib/constants/glossary";

export function PortfolioPanel() {
  const holdings = useSprintStore((s) => s.holdings);
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const stockData = useSprintStore((s) => s.stockData);
  const cashBalance = useSprintStore((s) => s.cashBalance);
  const getPrice = useSprintStore((s) => s.getPrice);
  const getHoldingPnL = useSprintStore((s) => s.getHoldingPnL);
  const getPortfolioValue = useSprintStore((s) => s.getPortfolioValue);
  const selectTicker = useSprintStore((s) => s.selectTicker);

  // Subscribe to currentMonth, stockData, and cashBalance so this
  // component re-renders when the month advances and prices change.
  void currentMonth;
  void stockData;
  void cashBalance;

  const holdingEntries = Object.values(holdings);
  const totalValue = getPortfolioValue();
  const totalPnL = totalValue - STARTING_BALANCE;
  const totalPnLPercent = (totalPnL / STARTING_BALANCE) * 100;
  const isUp = totalPnL >= 0;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Portfolio <InfoTooltip text={GLOSSARY.portfolioValue} />
        </h3>
        <div className="text-right">
          <span
            className={`text-sm font-bold ${
              isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isUp ? "+" : ""}
            {formatCurrency(totalPnL)} ({formatPercent(totalPnLPercent)})
          </span>
        </div>
      </div>

      {holdingEntries.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">
          No holdings yet. Buy your first stock!
        </p>
      ) : (
        <div className="space-y-2">
          {holdingEntries.map((holding) => {
            const price = getPrice(holding.ticker);
            const value = holding.shares * price;
            const pnl = getHoldingPnL(holding.ticker);
            const holdingIsUp = pnl.absolute >= 0;

            return (
              <button
                key={holding.ticker}
                className="w-full flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
                aria-label={`Select ${holding.ticker} — ${formatShares(holding.shares)} shares, ${formatCurrency(value)}`}
                onClick={() => selectTicker(holding.ticker)}
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {holding.ticker}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatShares(holding.shares)} shares
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-100">
                    {formatCurrency(value)}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      holdingIsUp ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {holdingIsUp ? "+" : ""}
                    {formatCurrency(pnl.absolute)} ({formatPercent(pnl.percent)})
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
