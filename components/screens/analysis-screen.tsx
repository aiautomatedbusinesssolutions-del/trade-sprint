"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { InfoTooltip } from "@/components/ui/tooltip";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { STARTING_BALANCE } from "@/lib/constants/tickers";
import { GLOSSARY } from "@/lib/constants/glossary";
import { YEAR_EVENTS } from "@/lib/constants/year-events";
import type { AnalysisResult, PortfolioSnapshot } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface BenchmarkReturn {
  value: number;
  percent: number;
}

interface AnalysisScreenProps {
  analysis: AnalysisResult;
  actualYear: number;
  finalValue: number;
  portfolioSnapshots: PortfolioSnapshot[];
  benchmarkReturn: BenchmarkReturn | null;
  onNewSprint: () => void;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 7 ? "emerald" : score >= 4 ? "amber" : "rose";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span
          className={`text-sm font-bold ${
            score >= 7
              ? "text-emerald-400"
              : score >= 4
                ? "text-amber-400"
                : "text-rose-400"
          }`}
        >
          {score}/10
        </span>
      </div>
      <ProgressBar value={score} max={10} color={color} />
    </div>
  );
}

interface PortfolioTooltipProps {
  active?: boolean;
  payload?: { payload: { label: string; value: number } }[];
}

function PortfolioTooltip({ active, payload }: PortfolioTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const change = data.value - STARTING_BALANCE;
  const changePercent = (change / STARTING_BALANCE) * 100;
  const isUp = change >= 0;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs space-y-1">
      <p className="font-medium text-slate-100">{data.label}</p>
      <p className="text-slate-300">{formatCurrency(data.value)}</p>
      <p className={isUp ? "text-emerald-400" : "text-rose-400"}>
        {isUp ? "+" : ""}
        {formatCurrency(change)} ({formatPercent(changePercent)})
      </p>
    </div>
  );
}

export function AnalysisScreen({
  analysis,
  actualYear,
  finalValue,
  portfolioSnapshots,
  benchmarkReturn,
  onNewSprint,
}: AnalysisScreenProps) {
  const totalReturn = finalValue - STARTING_BALANCE;
  const isUp = totalReturn >= 0;

  // Build chart data: start with initial balance, then each month's snapshot
  const chartData = [
    { label: "Start", value: STARTING_BALANCE },
    ...portfolioSnapshots.map((s) => ({
      label: `Mo ${s.month + 1}`,
      value: s.totalValue,
    })),
  ];

  // Determine chart color based on overall performance
  const chartColor = isUp ? "#34d399" : "#fb7185"; // emerald-400 or rose-400
  const gradientId = "portfolioGradient";

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        {/* Year Reveal */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500 uppercase tracking-wider animate-fade-in-up">
            Your Sprint Took Place In
          </p>
          <h1 className="text-6xl font-bold text-sky-400 animate-year-reveal">
            {actualYear}
          </h1>
        </div>

        {/* Historical Context */}
        {YEAR_EVENTS[actualYear] && (
          <Card className="space-y-3 animate-fade-in-up animate-delay-200">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
              What Happened in {actualYear}
            </h3>
            <ul className="space-y-2">
              {YEAR_EVENTS[actualYear].map((event, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-sky-400 mt-0.5">&#x2022;</span>
                  {event}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Performance Summary */}
        <Card className="text-center space-y-3 animate-fade-in-up animate-delay-300">
          <p className="text-sm text-slate-400">Final Portfolio Value <InfoTooltip text={GLOSSARY.totalReturn} /></p>
          <p className="text-4xl font-bold text-slate-100">
            {formatCurrency(finalValue)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant={isUp ? "success" : "danger"}>
              {isUp ? "+" : ""}
              {formatCurrency(totalReturn)}
            </Badge>
            <Badge variant={isUp ? "success" : "danger"}>
              {formatPercent(analysis.totalReturnPercent)}
            </Badge>
          </div>
        </Card>

        {/* S&P 500 Benchmark Comparison */}
        {benchmarkReturn && (
          <Card className="animate-fade-in-up animate-delay-300">
            <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide mb-4">
              You vs. Just Buying the S&P 500
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Your Performance */}
              <div className={`rounded-lg p-4 text-center ${
                totalReturn >= (benchmarkReturn.value - STARTING_BALANCE)
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-slate-800/50 border border-slate-700/50"
              }`}>
                <p className="text-xs text-slate-400 mb-1">Your Trading</p>
                <p className="text-2xl font-bold text-slate-100">
                  {formatCurrency(finalValue)}
                </p>
                <p className={`text-sm font-medium mt-1 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatPercent(analysis.totalReturnPercent)}
                </p>
              </div>

              {/* S&P 500 */}
              <div className={`rounded-lg p-4 text-center ${
                totalReturn < (benchmarkReturn.value - STARTING_BALANCE)
                  ? "bg-sky-500/10 border border-sky-500/20"
                  : "bg-slate-800/50 border border-slate-700/50"
              }`}>
                <p className="text-xs text-slate-400 mb-1">S&P 500 (Buy & Hold)</p>
                <p className="text-2xl font-bold text-slate-100">
                  {formatCurrency(benchmarkReturn.value)}
                </p>
                <p className={`text-sm font-medium mt-1 ${benchmarkReturn.percent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatPercent(benchmarkReturn.percent)}
                </p>
              </div>
            </div>

            {/* Verdict */}
            <div className="mt-4 text-center">
              {totalReturn >= (benchmarkReturn.value - STARTING_BALANCE) ? (
                <p className="text-sm text-emerald-400 font-medium">
                  You beat the S&P 500 by {formatCurrency(finalValue - benchmarkReturn.value)}!
                </p>
              ) : (
                <p className="text-sm text-sky-400 font-medium">
                  The S&P 500 beat you by {formatCurrency(benchmarkReturn.value - finalValue)}.
                  Most pros can&apos;t beat it either!
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Portfolio Performance Chart */}
        <Card className="space-y-3 animate-fade-in-up animate-delay-400">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
            Portfolio Value Over Time
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
                  width={55}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<PortfolioTooltip />} />
                <ReferenceLine
                  y={STARTING_BALANCE}
                  stroke="#475569"
                  strokeDasharray="4 4"
                  label={{ value: "$10k", fill: "#64748b", fontSize: 10, position: "right" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Dashed line shows your starting balance of {formatCurrency(STARTING_BALANCE)}.
          </p>
        </Card>

        {/* Trader Archetype */}
        <Card className="text-center space-y-2 border-sky-500/20 animate-fade-in-up animate-delay-500">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            Your Trader Type
          </p>
          <h2 className="text-2xl font-bold text-sky-400">
            {analysis.traderArchetype}
          </h2>
          <p className="text-sm text-slate-400">
            {analysis.archetypeDescription}
          </p>
        </Card>

        {/* Summary */}
        <Card className="animate-fade-in-up animate-delay-600">
          <p className="text-sm text-slate-300 leading-relaxed">
            {analysis.summary}
          </p>
        </Card>

        {/* Psychology Breakdown */}
        <Card className="space-y-4 animate-fade-in-up animate-delay-700">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
            Trading Psychology
          </h3>
          {analysis.psychologyBreakdown.map((item) => (
            <div key={item.category} className="space-y-1">
              <ScoreBar score={item.score} label={item.category} />
              <p className="text-xs text-slate-500 pl-1">{item.description}</p>
            </div>
          ))}
        </Card>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animate-delay-800">
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
              Strengths
            </h3>
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {analysis.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 mt-0.5">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* New Sprint */}
        <Button
          variant="primary"
          size="lg"
          className="w-full text-base font-bold animate-fade-in-up animate-delay-900"
          onClick={onNewSprint}
        >
          Start a New Sprint
        </Button>

        <p className="text-xs text-slate-500 text-center">
          This analysis is for learning purposes only and is not financial advice.
        </p>
      </div>
    </div>
  );
}
