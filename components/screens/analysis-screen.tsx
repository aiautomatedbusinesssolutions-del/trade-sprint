"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { AnalysisResult } from "@/lib/types";

interface AnalysisScreenProps {
  analysis: AnalysisResult;
  actualYear: number;
  finalValue: number;
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

export function AnalysisScreen({
  analysis,
  actualYear,
  finalValue,
  onNewSprint,
}: AnalysisScreenProps) {
  const totalReturn = finalValue - 10000;
  const isUp = totalReturn >= 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        {/* Year Reveal */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500 uppercase tracking-wider">
            Your Sprint Took Place In
          </p>
          <h1 className="text-6xl font-bold text-sky-400">{actualYear}</h1>
        </div>

        {/* Performance Summary */}
        <Card className="text-center space-y-3">
          <p className="text-sm text-slate-400">Final Portfolio Value</p>
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

        {/* Trader Archetype */}
        <Card className="text-center space-y-2 border-sky-500/20">
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
        <Card>
          <p className="text-sm text-slate-300 leading-relaxed">
            {analysis.summary}
          </p>
        </Card>

        {/* Psychology Breakdown */}
        <Card className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          className="w-full text-base font-bold"
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
