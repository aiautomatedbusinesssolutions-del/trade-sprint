import type { Holding, MonthlyBar } from "@/lib/types";
import { PRE_HISTORY_MONTHS } from "@/lib/constants/tickers";

/**
 * Get the stock price for a given sprint month (0-11).
 * Internally offsets by PRE_HISTORY_MONTHS since stockData arrays
 * contain pre-history + sprint months.
 */
export function getStockPrice(
  stockData: Record<string, MonthlyBar[]>,
  ticker: string,
  month: number
): number {
  const index = PRE_HISTORY_MONTHS + month;
  return stockData[ticker]?.[index]?.close ?? 0;
}

/**
 * Calculate the % change for a sprint month (0-11).
 * Compares to the previous bar in the full array (which may be pre-history).
 */
export function calculateMonthlyChange(
  bars: MonthlyBar[],
  month: number
): number {
  const index = PRE_HISTORY_MONTHS + month;
  if (!bars[index]) return 0;
  const prev = bars[index - 1]?.close;
  if (!prev || prev === 0) {
    return ((bars[index].close - bars[index].open) / bars[index].open) * 100;
  }
  return ((bars[index].close - prev) / prev) * 100;
}

export function calculateHoldingValue(
  holding: Holding,
  currentPrice: number
): number {
  return holding.shares * currentPrice;
}

export function calculateHoldingPnL(
  holding: Holding,
  currentPrice: number
): { absolute: number; percent: number } {
  const currentValue = holding.shares * currentPrice;
  const absolute = currentValue - holding.totalInvested;
  const percent =
    holding.totalInvested === 0
      ? 0
      : (absolute / holding.totalInvested) * 100;
  return { absolute, percent };
}

export function calculatePortfolioValue(
  holdings: Record<string, Holding>,
  stockData: Record<string, MonthlyBar[]>,
  currentMonth: number,
  cashBalance: number
): number {
  let holdingsValue = 0;
  for (const [ticker, holding] of Object.entries(holdings)) {
    const price = getStockPrice(stockData, ticker, currentMonth);
    holdingsValue += holding.shares * price;
  }
  return cashBalance + holdingsValue;
}

export function getTrendingStocks(
  stockData: Record<string, MonthlyBar[]>,
  month: number
): { ticker: string; changePercent: number }[] {
  return Object.entries(stockData)
    .map(([ticker, bars]) => ({
      ticker,
      changePercent: calculateMonthlyChange(bars, month),
    }))
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}
