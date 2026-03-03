import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Trade, PortfolioSnapshot, AnalysisResult } from "@/lib/types";

export async function generateAnalysis(
  tradeHistory: Trade[],
  portfolioSnapshots: PortfolioSnapshot[],
  finalValue: number,
  startingBalance: number,
  actualYear: number
): Promise<AnalysisResult> {
  const totalReturn = finalValue - startingBalance;
  const totalReturnPercent = (totalReturn / startingBalance) * 100;

  const tradesSummary = tradeHistory
    .map(
      (t) =>
        `Month ${t.month + 1}: ${t.side.toUpperCase()} $${t.dollarAmount.toFixed(2)} of ${t.ticker} at $${t.priceAtExecution.toFixed(2)}${t.reason ? ` (Reason: "${t.reason}")` : ""}`
    )
    .join("\n");

  const snapshotsSummary = portfolioSnapshots
    .map(
      (s) =>
        `Month ${s.month + 1}: Total $${s.totalValue.toFixed(2)} (Cash: $${s.cashBalance.toFixed(2)}, Holdings: $${s.holdingsValue.toFixed(2)})`
    )
    .join("\n");

  const prompt = `You are a friendly, encouraging trading coach analyzing a beginner's paper trading sprint. They traded with $10,000 of fake money over 12 months in the year ${actualYear}.

TRADE HISTORY:
${tradesSummary || "No trades were made."}

PORTFOLIO VALUE OVER TIME:
${snapshotsSummary}

FINAL RESULT: Started with $${startingBalance.toFixed(2)}, ended with $${finalValue.toFixed(2)} (${totalReturnPercent >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%)

Analyze their trading psychology and behavior. Be encouraging but honest. Use simple, beginner-friendly language (no jargon). If they provided reasons for their trades, evaluate whether their reasoning was sound and mention this in your analysis.

Respond with ONLY valid JSON in this exact format:
{
  "summary": "A 2-3 sentence overview of their trading style and results",
  "psychologyBreakdown": [
    {"category": "Risk Management", "score": 1-10, "description": "Brief explanation"},
    {"category": "Diversification", "score": 1-10, "description": "Brief explanation"},
    {"category": "Timing", "score": 1-10, "description": "Brief explanation"},
    {"category": "Patience", "score": 1-10, "description": "Brief explanation"},
    {"category": "Emotional Control", "score": 1-10, "description": "Brief explanation"}
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "traderArchetype": "A catchy 2-3 word archetype name",
  "archetypeDescription": "A fun 1-2 sentence description of this trader type"
}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = text.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", cleaned.slice(0, 200));
    throw new Error("Failed to parse analysis response");
  }

  if (!parsed.psychologyBreakdown || !Array.isArray(parsed.psychologyBreakdown)) {
    throw new Error("Invalid analysis structure from Gemini");
  }

  return {
    ...parsed,
    totalReturn,
    totalReturnPercent,
  };
}
