import { NextResponse } from "next/server";
import { generateAnalysis } from "@/lib/services/gemini";
import type { Trade, PortfolioSnapshot } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tradeHistory,
      portfolioSnapshots,
      finalValue,
      actualYear,
    }: {
      tradeHistory: Trade[];
      portfolioSnapshots: PortfolioSnapshot[];
      finalValue: number;
      actualYear: number;
    } = body;

    if (!process.env.GEMINI_API_KEY) {
      // Return mock analysis when no API key is configured
      return NextResponse.json({
        summary:
          "You completed your first trading sprint! This is a great start to learning about the market.",
        psychologyBreakdown: [
          { category: "Risk Management", score: 6, description: "You showed moderate caution with your trades." },
          { category: "Diversification", score: 5, description: "There's room to spread your investments across more stocks." },
          { category: "Timing", score: 6, description: "Your entry and exit points were reasonable." },
          { category: "Patience", score: 7, description: "You didn't panic sell during dips." },
          { category: "Emotional Control", score: 6, description: "You stayed relatively level-headed throughout." },
        ],
        strengths: [
          "You took the initiative to start trading",
          "You maintained a balanced approach",
          "You completed the full 12-month sprint",
        ],
        improvements: [
          "Try diversifying across different industries",
          "Consider setting target prices before buying",
          "Practice smaller, more frequent trades to learn patterns",
        ],
        traderArchetype: "The Explorer",
        archetypeDescription:
          "You're curious and willing to try new things. With more experience, your natural curiosity will become a real strength.",
        totalReturn: finalValue - 10000,
        totalReturnPercent: ((finalValue - 10000) / 10000) * 100,
      });
    }

    const analysis = await generateAnalysis(
      tradeHistory,
      portfolioSnapshots,
      finalValue,
      10000,
      actualYear
    );

    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate analysis", details: message },
      { status: 500 }
    );
  }
}
