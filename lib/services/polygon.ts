import type { MonthlyBar, SprintData } from "@/lib/types";
import { ALL_TICKERS, PRE_HISTORY_MONTHS, TOTAL_MONTHS } from "@/lib/constants/tickers";

const POLYGON_BASE = "https://api.polygon.io";
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 13000; // 13s between batches (free tier: 5 calls/min)

// Years supported by Polygon free tier (recent ~2 years of data)
// Upgrade Polygon plan to add older years like 2015-2023
const POLYGON_YEARS = [2025];

interface PolygonBar {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  t: number; // timestamp (ms)
}

interface PolygonAggResponse {
  ticker: string;
  resultsCount: number;
  results?: PolygonBar[];
  status: string;
  error?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTickerBars(
  ticker: string,
  from: string,
  to: string,
  apiKey: string,
  retries = 2
): Promise<MonthlyBar[] | null> {
  const url = `${POLYGON_BASE}/v2/aggs/ticker/${ticker}/range/1/month/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      if (res.status === 429) {
        // Rate limited — wait and retry
        const retryAfter = parseInt(res.headers.get("Retry-After") || "15", 10);
        console.log(`Rate limited on ${ticker}, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!res.ok) {
        console.warn(`Polygon API error for ${ticker}: ${res.status}`);
        return null;
      }

      const data: PolygonAggResponse = await res.json();

      if (!data.results || data.results.length === 0) {
        console.warn(`No data for ${ticker} in range ${from} to ${to}`);
        return null;
      }

      return data.results.map((bar) => ({
        open: Math.round(bar.o * 100) / 100,
        high: Math.round(bar.h * 100) / 100,
        low: Math.round(bar.l * 100) / 100,
        close: Math.round(bar.c * 100) / 100,
        volume: Math.round(bar.v),
      }));
    } catch (err) {
      console.warn(`Fetch error for ${ticker} (attempt ${attempt + 1}):`, err);
      if (attempt < retries) await sleep(2000);
    }
  }

  return null;
}

/**
 * Computes the date range we need: 6 pre-history months + 12 sprint months.
 * For year 2020: from = 2019-07-01, to = 2020-12-31
 */
function getDateRange(year: number): { from: string; to: string } {
  const startMonth = 1 - PRE_HISTORY_MONTHS; // e.g., -5 (meaning July of prior year)
  const startDate = new Date(year, startMonth - 1, 1); // month is 0-indexed
  const endDate = new Date(year, 11, 31); // Dec 31 of the sprint year

  const from = startDate.toISOString().split("T")[0];
  const to = endDate.toISOString().split("T")[0];

  return { from, to };
}

export async function fetchPolygonSprintData(): Promise<SprintData> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    throw new Error("POLYGON_API_KEY not set");
  }

  // Pick a random year from Polygon-compatible years
  const yearIndex = Math.floor(Math.random() * POLYGON_YEARS.length);
  const actualYear = POLYGON_YEARS[yearIndex];
  const { from, to } = getDateRange(actualYear);
  const expectedBars = PRE_HISTORY_MONTHS + TOTAL_MONTHS; // 18

  console.log(`Fetching Polygon data for year ${actualYear} (${from} to ${to})`);

  const stockData: Record<string, MonthlyBar[]> = {};
  const availableTickers: string[] = [];

  // Process tickers in batches to respect rate limits
  for (let i = 0; i < ALL_TICKERS.length; i += BATCH_SIZE) {
    const batch = ALL_TICKERS.slice(i, i + BATCH_SIZE);

    // Fetch batch in parallel
    const results = await Promise.all(
      batch.map((ticker) => fetchTickerBars(ticker, from, to, apiKey))
    );

    for (let j = 0; j < batch.length; j++) {
      const ticker = batch[j];
      const bars = results[j];

      if (bars && bars.length >= expectedBars) {
        // Exact match — use all bars
        stockData[ticker] = bars.slice(0, expectedBars);
        availableTickers.push(ticker);
      } else if (bars && bars.length > 0) {
        // Partial data — pad with repeated first bar if we have enough sprint months
        if (bars.length >= TOTAL_MONTHS) {
          // We have enough for the sprint, pad pre-history
          const padCount = expectedBars - bars.length;
          const padBar = bars[0];
          const padded = Array(padCount).fill(padBar).concat(bars);
          stockData[ticker] = padded.slice(0, expectedBars);
          availableTickers.push(ticker);
        } else {
          console.warn(`Skipping ${ticker}: only ${bars.length} bars (need ${TOTAL_MONTHS}+)`);
        }
      }
    }

    // Wait between batches (skip wait after last batch)
    if (i + BATCH_SIZE < ALL_TICKERS.length) {
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} done. Waiting for rate limit...`);
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`Polygon data loaded: ${availableTickers.length} tickers available`);

  if (availableTickers.length === 0) {
    throw new Error("No ticker data returned from Polygon. Check your API key and plan.");
  }

  return {
    actualYear,
    stockData,
    availableTickers,
  };
}
