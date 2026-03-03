"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatShares } from "@/lib/utils/format";

export function TradeHistory() {
  const tradeHistory = useSprintStore((s) => s.tradeHistory);
  const currentMonth = useSprintStore((s) => s.currentMonth);

  // Force reactivity on month changes
  void currentMonth;

  if (tradeHistory.length === 0) {
    return (
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Trade History
        </h3>
        <p className="text-sm text-slate-500 py-4 text-center">
          No trades yet. Buy your first stock above!
        </p>
      </Card>
    );
  }

  // Show most recent trades first
  const sortedTrades = [...tradeHistory].reverse();

  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Trade History
        </h3>
        <span className="text-xs text-slate-500">
          {tradeHistory.length} trade{tradeHistory.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {sortedTrades.map((trade, i) => {
          const isBuy = trade.side === "buy";
          return (
            <div
              key={`${trade.month}-${trade.ticker}-${trade.orderIndex}-${i}`}
              className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <Badge variant={isBuy ? "success" : "danger"}>
                  {isBuy ? "BUY" : "SELL"}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {trade.ticker}
                  </p>
                  <p className="text-xs text-slate-500">
                    Month {trade.month + 1} &middot; {formatShares(trade.shares)} shares @ {formatCurrency(trade.priceAtExecution)}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm font-medium ${
                  isBuy ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {isBuy ? "-" : "+"}
                {formatCurrency(trade.dollarAmount)}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
