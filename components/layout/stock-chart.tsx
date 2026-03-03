"use client";

import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { PRE_HISTORY_MONTHS } from "@/lib/constants/tickers";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: { tooltipLabel: string; close: number; open: number; high: number; low: number } }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs space-y-1">
      <p className="font-medium text-slate-100">{data.tooltipLabel}</p>
      <div className="grid grid-cols-2 gap-x-3 text-slate-400">
        <span>Open: {formatCurrency(data.open)}</span>
        <span>Close: {formatCurrency(data.close)}</span>
        <span>High: {formatCurrency(data.high)}</span>
        <span>Low: {formatCurrency(data.low)}</span>
      </div>
    </div>
  );
}

export function StockChart() {
  const selectedTicker = useSprintStore((s) => s.selectedTicker);
  const stockData = useSprintStore((s) => s.stockData);
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const getChange = useSprintStore((s) => s.getChange);

  if (!selectedTicker || !stockData[selectedTicker]) {
    return (
      <Card className="flex items-center justify-center h-64">
        <p className="text-slate-500">Select a stock to see the chart</p>
      </Card>
    );
  }

  // Show all pre-history + revealed sprint months
  const endIndex = PRE_HISTORY_MONTHS + currentMonth + 1;
  const bars = stockData[selectedTicker].slice(0, endIndex);

  const chartData = bars.map((bar, i) => {
    const isPreHistory = i < PRE_HISTORY_MONTHS;
    const sprintMonth = i - PRE_HISTORY_MONTHS + 1;
    // Pre-history: show "-3Y", "-2Y", "-1Y" at year boundaries, empty otherwise
    // Sprint months: show "Mo 1" through "Mo 12"
    let label: string;
    if (isPreHistory) {
      const monthsBeforeSprint = PRE_HISTORY_MONTHS - i;
      if (monthsBeforeSprint % 12 === 0) {
        label = `-${monthsBeforeSprint / 12}Y`;
      } else if (monthsBeforeSprint === 6) {
        label = "-6M";
      } else {
        label = "";
      }
    } else {
      label = `Mo ${sprintMonth}`;
    }
    return {
      label,
      tooltipLabel: isPreHistory
        ? `${PRE_HISTORY_MONTHS - i} months before sprint`
        : `Month ${sprintMonth} of sprint`,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
      isPreHistory,
    };
  });

  const currentPrice = bars[bars.length - 1]?.close ?? 0;
  const change = getChange(selectedTicker);
  const isUp = change >= 0;

  // The label where the sprint starts (for the reference line)
  const sprintStartLabel = `Mo 1`;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100">
            {selectedTicker}
          </h2>
          <p className="text-sm text-slate-400">Price History</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-100">
            {formatCurrency(currentPrice)}
          </p>
          <p
            className={`text-sm font-medium ${
              isUp ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatPercent(change)} this month
          </p>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={65}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine
              x={sprintStartLabel}
              stroke="#475569"
              strokeDasharray="4 4"
              label={{ value: "Sprint Start", fill: "#64748b", fontSize: 10, position: "top" }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Dashed line marks where your sprint begins. Left side shows 3 years of prior price history.
      </p>
    </Card>
  );
}
