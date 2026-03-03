import type { MonthlyBar, SprintData } from "@/lib/types";
import { POPULAR_TICKERS, BENCHMARK_TICKER, PRE_HISTORY_MONTHS, TOTAL_MONTHS } from "@/lib/constants/tickers";

const TIINGO_BASE = "https://api.tiingo.com/tiingo/daily";
const REQUEST_DELAY_MS = 300; // 300ms between sequential requests (safe for hourly quota)

// Use a trimmed ticker list: SPY (benchmark) + popular (15) + extras to stay under hourly quota
// Tiingo free tier: ~50 requests/hour, so we target ~36 tickers max
const TIINGO_TICKERS = [
  BENCHMARK_TICKER, // SPY — always fetch for S&P 500 benchmark
  ...POPULAR_TICKERS,
  // Add some extras from each sector not in POPULAR_TICKERS
  "ADBE", "CRM", "AMD", "PYPL", "SQ",   // Tech
  "BAC", "GS", "V", "MA",                // Finance
  "PFE", "UNH", "MRK",                   // Healthcare
  "MCD", "HD", "SBUX",                   // Consumer
  "XOM", "CVX",                           // Energy
  "BA", "CAT",                            // Industrial
].filter((t, i, arr) => arr.indexOf(t) === i); // deduplicate

// With Tiingo's 30+ years of free data, we can use a wide range of years.
const TIINGO_YEARS = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
  2020, 2021, 2022, 2023, 2024, 2025,
];

interface TiingoBar {
  date: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  adjClose: number;
  adjHigh: number;
  adjLow: number;
  adjOpen: number;
  adjVolume: number;
}

class HourlyQuotaExhaustedError extends Error {
  constructor() {
    super("Tiingo hourly request quota exhausted");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDateRange(year: number): { from: string; to: string } {
  const startDate = new Date(year - 1, 12 - PRE_HISTORY_MONTHS, 1);
  const endDate = new Date(year, 11, 31);

  const from = startDate.toISOString().split("T")[0];
  const to = endDate.toISOString().split("T")[0];

  return { from, to };
}

async function fetchTickerBars(
  ticker: string,
  from: string,
  to: string,
  apiKey: string,
): Promise<MonthlyBar[] | null> {
  const url = `${TIINGO_BASE}/${ticker}/prices?startDate=${from}&endDate=${to}&resampleFreq=monthly&token=${apiKey}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (res.status === 429) {
    // Hourly quota exhausted — throw to trigger fast fallback to mock data
    throw new HourlyQuotaExhaustedError();
  }

  if (res.status === 404 || !res.ok) {
    return null;
  }

  const data: TiingoBar[] = await res.json();

  if (!data || data.length === 0) {
    return null;
  }

  return data.map((bar) => ({
    open: Math.round(bar.adjOpen * 100) / 100,
    high: Math.round(bar.adjHigh * 100) / 100,
    low: Math.round(bar.adjLow * 100) / 100,
    close: Math.round(bar.adjClose * 100) / 100,
    volume: Math.round(bar.adjVolume),
  }));
}

export async function fetchTiingoSprintData(): Promise<SprintData> {
  const apiKey = process.env.TIINGO_API_KEY;
  if (!apiKey) {
    throw new Error("TIINGO_API_KEY not set");
  }

  const yearIndex = Math.floor(Math.random() * TIINGO_YEARS.length);
  const actualYear = TIINGO_YEARS[yearIndex];
  const { from, to } = getDateRange(actualYear);
  const expectedBars = PRE_HISTORY_MONTHS + TOTAL_MONTHS;

  console.log(`Fetching Tiingo data for year ${actualYear} (${from} to ${to}), ${TIINGO_TICKERS.length} tickers`);

  const stockData: Record<string, MonthlyBar[]> = {};
  const availableTickers: string[] = [];

  // Fetch tickers one at a time with delays to respect rate limits
  for (let i = 0; i < TIINGO_TICKERS.length; i++) {
    const ticker = TIINGO_TICKERS[i];

    // This will throw HourlyQuotaExhaustedError on 429, which bubbles up
    // to the API route's catch block and triggers mock data fallback
    const bars = await fetchTickerBars(ticker, from, to, apiKey);

    if (bars && bars.length >= expectedBars) {
      stockData[ticker] = bars.slice(0, expectedBars);
      availableTickers.push(ticker);
    } else if (bars && bars.length >= TOTAL_MONTHS) {
      const padCount = expectedBars - bars.length;
      const padBar = bars[0];
      const padded = Array(padCount).fill(padBar).concat(bars);
      stockData[ticker] = padded.slice(0, expectedBars);
      availableTickers.push(ticker);
    } else if (bars) {
      console.warn(`Skipping ${ticker}: only ${bars.length} bars`);
    }

    // Delay between requests (skip after last one)
    if (i < TIINGO_TICKERS.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${TIINGO_TICKERS.length} tickers (${availableTickers.length} available)`);
    }
  }

  console.log(`Tiingo data loaded: ${availableTickers.length} tickers for year ${actualYear}`);

  if (availableTickers.length === 0) {
    throw new Error("No ticker data returned from Tiingo.");
  }

  return {
    actualYear,
    stockData,
    availableTickers,
  };
}
