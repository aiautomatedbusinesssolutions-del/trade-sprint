import type { MonthlyBar, SprintData } from "@/lib/types";
import { ALL_TICKERS, VALID_YEARS, PRE_HISTORY_MONTHS, TOTAL_MONTHS } from "@/lib/constants/tickers";

// Seeded random number generator for consistent data per year
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Realistic base prices for known tickers (approximate 2020 prices)
const BASE_PRICES: Record<string, number> = {
  AAPL: 130, MSFT: 220, AMZN: 3200, GOOGL: 1750, TSLA: 700,
  META: 270, NVDA: 530, NFLX: 540, ADBE: 470, CRM: 220,
  INTC: 50, AMD: 90, PYPL: 240, SQ: 220, SHOP: 1100,
  UBER: 55, SNAP: 50, PINS: 65, ZM: 340, ROKU: 330,
  JPM: 130, BAC: 30, WFC: 32, GS: 270, MS: 70,
  V: 210, MA: 340, AXP: 120,
  JNJ: 160, PFE: 37, UNH: 350, ABBV: 105, MRK: 80, TMO: 470,
  WMT: 140, KO: 55, PEP: 145, NKE: 140, DIS: 175,
  MCD: 215, SBUX: 100, HD: 270, LOW: 165, TGT: 180,
  XOM: 45, CVX: 90, COP: 45,
  BA: 215, CAT: 190, GE: 95,
};

function generateTickerData(
  ticker: string,
  year: number,
  rng: () => number
): MonthlyBar[] {
  const basePrice = BASE_PRICES[ticker] ?? 100;
  // Vary base price by year seed
  const yearMultiplier = 0.6 + rng() * 0.8;
  let price = basePrice * yearMultiplier;

  const bars: MonthlyBar[] = [];

  // Generate a trend direction for the year
  const yearTrend = (rng() - 0.45) * 0.03; // slight upward bias
  const volatility = 0.03 + rng() * 0.12; // 3%-15% monthly volatility

  const totalBars = PRE_HISTORY_MONTHS + TOTAL_MONTHS;
  for (let month = 0; month < totalBars; month++) {
    const open = price;
    const monthReturn = yearTrend + (rng() - 0.5) * volatility * 2;
    const close = open * (1 + monthReturn);

    // High and low within the month
    const range = Math.abs(close - open) + open * volatility * rng();
    const high = Math.max(open, close) + range * rng() * 0.5;
    const low = Math.min(open, close) - range * rng() * 0.5;

    // Volume: base volume with some randomness
    const baseVolume = (5 + rng() * 50) * 1_000_000;
    const volume = Math.round(baseVolume * (0.7 + rng() * 0.6));

    bars.push({
      open: Math.round(open * 100) / 100,
      high: Math.round(Math.max(high, open, close) * 100) / 100,
      low: Math.round(Math.max(Math.min(low, open, close), 1) * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });

    price = close;
  }

  return bars;
}

export function generateMockSprintData(): SprintData {
  const yearIndex = Math.floor(Math.random() * VALID_YEARS.length);
  const actualYear = VALID_YEARS[yearIndex];
  const rng = seededRandom(actualYear * 31337);

  const stockData: Record<string, MonthlyBar[]> = {};

  for (const ticker of ALL_TICKERS) {
    // Each ticker gets its own rng chain branched from the year seed
    const tickerSeed = actualYear * 31337 + ticker.charCodeAt(0) * 1000 + ticker.length;
    const tickerRng = seededRandom(tickerSeed);
    stockData[ticker] = generateTickerData(ticker, actualYear, tickerRng);
  }

  return {
    actualYear,
    stockData,
    availableTickers: ALL_TICKERS,
  };
}
