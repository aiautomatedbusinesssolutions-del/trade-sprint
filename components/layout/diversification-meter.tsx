"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/tooltip";
import { TICKER_SECTORS, SECTOR_COLORS } from "@/lib/constants/tickers";
import { GLOSSARY } from "@/lib/constants/glossary";

export function DiversificationMeter() {
  const holdings = useSprintStore((s) => s.holdings);
  const getPrice = useSprintStore((s) => s.getPrice);
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const stockData = useSprintStore((s) => s.stockData);

  // Force reactivity
  void currentMonth;
  void stockData;

  const holdingEntries = Object.values(holdings);

  if (holdingEntries.length === 0) {
    return (
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Diversification <InfoTooltip text={GLOSSARY.diversification} />
        </h3>
        <p className="text-sm text-slate-500 text-center py-3">
          Buy stocks to see your diversification
        </p>
      </Card>
    );
  }

  // Calculate sector allocations by market value
  const sectorValues: Record<string, number> = {};
  let totalValue = 0;

  for (const holding of holdingEntries) {
    const price = getPrice(holding.ticker);
    const value = holding.shares * price;
    const sector = TICKER_SECTORS[holding.ticker] ?? "Other";
    sectorValues[sector] = (sectorValues[sector] ?? 0) + value;
    totalValue += value;
  }

  // Calculate percentages and HHI
  const sectorAllocations = Object.entries(sectorValues)
    .map(([sector, value]) => ({
      sector,
      value,
      percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.percent - a.percent);

  // HHI: sum of squared percentages (range: 10000/N to 10000)
  const hhi = sectorAllocations.reduce((sum, s) => sum + s.percent ** 2, 0);

  // Diversification score: 0-100 (100 = perfectly diversified)
  const maxHHI = 10000;
  const idealHHI = 10000 / 6; // 6 available sectors
  const score = Math.round(
    Math.max(0, Math.min(100, ((maxHHI - hhi) / (maxHHI - idealHHI)) * 100))
  );

  const scoreColor =
    score >= 60
      ? "text-emerald-400"
      : score >= 30
        ? "text-amber-400"
        : "text-rose-400";
  const scoreLabel =
    score >= 60
      ? "Well Diversified"
      : score >= 30
        ? "Moderately Concentrated"
        : "Highly Concentrated";

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Diversification <InfoTooltip text={GLOSSARY.diversification} />
        </h3>
        <span className={`text-sm font-bold ${scoreColor}`}>{score}/100</span>
      </div>

      {/* Segmented bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
        {sectorAllocations.map(({ sector, percent }) => (
          <div
            key={sector}
            className={`${SECTOR_COLORS[sector] ?? "bg-slate-500"} transition-all duration-500`}
            style={{ width: `${percent}%` }}
            title={`${sector}: ${percent.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Score label */}
      <p className={`text-xs text-center ${scoreColor}`}>{scoreLabel}</p>

      {/* Sector legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {sectorAllocations.map(({ sector, percent }) => (
          <div key={sector} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${SECTOR_COLORS[sector] ?? "bg-slate-500"}`}
            />
            <span className="text-xs text-slate-400">
              {sector} {percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
