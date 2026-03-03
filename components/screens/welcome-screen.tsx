"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
  isLoading: boolean;
  error?: string | null;
}

const rules = [
  {
    icon: "💰",
    title: "Start with $10,000",
    description:
      "You get $10,000 of play money to invest however you want. No real risk involved.",
  },
  {
    icon: "📈",
    title: "Trade for 12 Months",
    description:
      "Buy and sell stocks each month. You won't know which year you're in — it's a mystery!",
  },
  {
    icon: "🧠",
    title: "Get Your Analysis",
    description:
      "After 12 months, AI reviews your trading style and tells you what kind of trader you are.",
  },
];

export function WelcomeScreen({ onStart, isLoading, error }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold tracking-tight text-slate-100">
            TradeSprint
          </h1>
          <p className="text-lg text-slate-400">
            Learn to trade with $10,000 of play money. No risk. Real lessons.
          </p>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.title} className="text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{rule.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-100">{rule.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {rule.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        <Button
          variant="success"
          size="lg"
          className="w-full text-lg font-bold"
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? "Preparing Markets..." : "Start Sprint"}
        </Button>

        <a
          href="/leaderboard"
          className="block text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2"
        >
          View Leaderboard
        </a>

        <p className="text-xs text-slate-500">
          This is a learning tool using simulated markets. Past performance
          doesn&apos;t predict future results.
        </p>
      </div>
    </div>
  );
}
