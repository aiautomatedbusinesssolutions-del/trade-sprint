"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSprintStore } from "@/lib/store/sprint-store";
import { TopBar } from "@/components/layout/top-bar";
import { StockChart } from "@/components/layout/stock-chart";
import { TradePanel } from "@/components/layout/trade-panel";
import { PortfolioPanel } from "@/components/layout/portfolio-panel";
import { SuggestedStocks } from "@/components/layout/suggested-stocks";
import { TradeHistory } from "@/components/layout/trade-history";
import { DiversificationMeter } from "@/components/layout/diversification-meter";
import { NextMonthButton } from "@/components/layout/next-month-button";

export default function DashboardPage() {
  const router = useRouter();
  const status = useSprintStore((s) => s.status);

  useEffect(() => {
    // Only redirect to home if the sprint hasn't started.
    // Don't redirect on "finished" — NextMonthButton handles that navigation to /analysis.
    if (status === "idle" || status === "loading") {
      router.push("/");
    }
  }, [status, router]);

  if (status !== "trading" && status !== "finished") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <TopBar />
          <StockChart />
          <SuggestedStocks />
          <TradeHistory />
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-4">
          <TradePanel />
          <PortfolioPanel />
          <DiversificationMeter />
          <NextMonthButton />
        </div>
      </div>
    </div>
  );
}
