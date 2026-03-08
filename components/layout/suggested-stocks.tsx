"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { POPULAR_TICKERS } from "@/lib/constants/tickers";

function StockChip({
  ticker,
  price,
  change,
  onClick,
}: {
  ticker: string;
  price: number;
  change: number;
  onClick: () => void;
}) {
  const isUp = change >= 0;
  return (
    <button
      onClick={onClick}
      aria-label={`Select ${ticker}`}
      className="flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 hover:border-slate-600 transition-colors min-w-[120px]"
    >
      <p className="text-sm font-medium text-slate-100">{ticker}</p>
      <p className="text-xs text-slate-500">{formatCurrency(price)}</p>
      <p
        className={`text-xs font-medium ${
          isUp ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        {formatPercent(change)}
      </p>
    </button>
  );
}

export function SuggestedStocks() {
  const stockData = useSprintStore((s) => s.stockData);
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const selectTicker = useSprintStore((s) => s.selectTicker);
  const getPrice = useSprintStore((s) => s.getPrice);
  const getChange = useSprintStore((s) => s.getChange);
  const getTrending = useSprintStore((s) => s.getTrending);

  // Subscribe to currentMonth so prices/trends update when month advances
  void currentMonth;

  const trending = getTrending().slice(0, 10);
  const popular = POPULAR_TICKERS.filter((t) => stockData[t]);

  return (
    <div className="space-y-4">
      {/* Popular Stocks */}
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Popular Stocks
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {popular.map((ticker) => (
            <StockChip
              key={ticker}
              ticker={ticker}
              price={getPrice(ticker)}
              change={getChange(ticker)}
              onClick={() => selectTicker(ticker)}
            />
          ))}
        </div>
      </Card>

      {/* Trending This Month */}
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Trending This Month
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {trending.map(({ ticker, changePercent }) => (
            <StockChip
              key={ticker}
              ticker={ticker}
              price={getPrice(ticker)}
              change={changePercent}
              onClick={() => selectTicker(ticker)}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
