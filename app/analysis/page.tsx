"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSprintStore } from "@/lib/store/sprint-store";
import { AnalysisScreen } from "@/components/screens/analysis-screen";
import { LoadingScreen } from "@/components/screens/loading-screen";
import type { AnalysisResult } from "@/lib/types";

export default function AnalysisPage() {
  const router = useRouter();
  const status = useSprintStore((s) => s.status);
  const actualYear = useSprintStore((s) => s.actualYear);
  const tradeHistory = useSprintStore((s) => s.tradeHistory);
  const portfolioSnapshots = useSprintStore((s) => s.portfolioSnapshots);
  const getPortfolioValue = useSprintStore((s) => s.getPortfolioValue);
  const reset = useSprintStore((s) => s.reset);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const finalValue = getPortfolioValue();

  useEffect(() => {
    if (status !== "finished") {
      router.push("/");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tradeHistory,
            portfolioSnapshots,
            finalValue,
            actualYear,
          }),
        });

        if (!res.ok) throw new Error("Analysis failed");
        const data = await res.json();
        setAnalysis(data);
      } catch {
        // Fallback analysis if API fails
        setAnalysis({
          summary: "Your sprint is complete! Review your trades to see how you did.",
          psychologyBreakdown: [
            { category: "Risk Management", score: 5, description: "Analysis unavailable" },
            { category: "Diversification", score: 5, description: "Analysis unavailable" },
            { category: "Timing", score: 5, description: "Analysis unavailable" },
            { category: "Patience", score: 5, description: "Analysis unavailable" },
            { category: "Emotional Control", score: 5, description: "Analysis unavailable" },
          ],
          strengths: ["Completed the full sprint", "Gained trading experience"],
          improvements: ["Try again for a more detailed analysis"],
          traderArchetype: "The Learner",
          archetypeDescription: "Every expert was once a beginner. Keep practicing!",
          totalReturn: finalValue - 10000,
          totalReturnPercent: ((finalValue - 10000) / 10000) * 100,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [status, router, tradeHistory, portfolioSnapshots, finalValue, actualYear]);

  if (status !== "finished") return null;
  if (loading) return <LoadingScreen />;
  if (!analysis || !actualYear) return null;

  return (
    <AnalysisScreen
      analysis={analysis}
      actualYear={actualYear}
      finalValue={finalValue}
      portfolioSnapshots={portfolioSnapshots}
      onNewSprint={() => {
        reset();
        router.push("/");
      }}
    />
  );
}
