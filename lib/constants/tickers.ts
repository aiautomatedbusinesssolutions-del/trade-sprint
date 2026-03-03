export const POPULAR_TICKERS = [
  "AAPL",
  "MSFT",
  "AMZN",
  "GOOGL",
  "TSLA",
  "META",
  "NVDA",
  "JPM",
  "JNJ",
  "WMT",
  "DIS",
  "NFLX",
  "KO",
  "PEP",
  "NKE",
];

// SPY is always fetched for the S&P 500 benchmark comparison
export const BENCHMARK_TICKER = "SPY";

export const ALL_TICKERS = [
  // Benchmark
  "SPY",
  // Tech
  "AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "META", "NVDA", "NFLX", "ADBE", "CRM",
  "INTC", "AMD", "PYPL", "SQ", "SHOP", "UBER", "SNAP", "PINS", "ZM", "ROKU",
  // Finance
  "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP",
  // Healthcare
  "JNJ", "PFE", "UNH", "ABBV", "MRK", "TMO",
  // Consumer
  "WMT", "KO", "PEP", "NKE", "DIS", "MCD", "SBUX", "HD", "LOW", "TGT",
  // Energy
  "XOM", "CVX", "COP",
  // Industrial
  "BA", "CAT", "GE",
];

export const TICKER_NAMES: Record<string, string> = {
  SPY: "S&P 500 ETF",
  AAPL: "Apple",
  MSFT: "Microsoft",
  AMZN: "Amazon",
  GOOGL: "Alphabet",
  TSLA: "Tesla",
  META: "Meta",
  NVDA: "Nvidia",
  NFLX: "Netflix",
  ADBE: "Adobe",
  CRM: "Salesforce",
  INTC: "Intel",
  AMD: "AMD",
  PYPL: "PayPal",
  SQ: "Block",
  SHOP: "Shopify",
  UBER: "Uber",
  SNAP: "Snap",
  PINS: "Pinterest",
  ZM: "Zoom",
  ROKU: "Roku",
  JPM: "JPMorgan",
  BAC: "Bank of America",
  WFC: "Wells Fargo",
  GS: "Goldman Sachs",
  MS: "Morgan Stanley",
  V: "Visa",
  MA: "Mastercard",
  AXP: "American Express",
  JNJ: "Johnson & Johnson",
  PFE: "Pfizer",
  UNH: "UnitedHealth",
  ABBV: "AbbVie",
  MRK: "Merck",
  TMO: "Thermo Fisher",
  WMT: "Walmart",
  KO: "Coca-Cola",
  PEP: "PepsiCo",
  NKE: "Nike",
  DIS: "Disney",
  MCD: "McDonald's",
  SBUX: "Starbucks",
  HD: "Home Depot",
  LOW: "Lowe's",
  TGT: "Target",
  XOM: "ExxonMobil",
  CVX: "Chevron",
  COP: "ConocoPhillips",
  BA: "Boeing",
  CAT: "Caterpillar",
  GE: "GE Aerospace",
};

export const TICKER_SECTORS: Record<string, string> = {
  SPY: "Index",
  AAPL: "Technology", MSFT: "Technology", AMZN: "Technology", GOOGL: "Technology",
  TSLA: "Technology", META: "Technology", NVDA: "Technology", NFLX: "Technology",
  ADBE: "Technology", CRM: "Technology", INTC: "Technology", AMD: "Technology",
  PYPL: "Technology", SQ: "Technology", SHOP: "Technology", UBER: "Technology",
  SNAP: "Technology", PINS: "Technology", ZM: "Technology", ROKU: "Technology",
  JPM: "Finance", BAC: "Finance", WFC: "Finance", GS: "Finance",
  MS: "Finance", V: "Finance", MA: "Finance", AXP: "Finance",
  JNJ: "Healthcare", PFE: "Healthcare", UNH: "Healthcare",
  ABBV: "Healthcare", MRK: "Healthcare", TMO: "Healthcare",
  WMT: "Consumer", KO: "Consumer", PEP: "Consumer", NKE: "Consumer",
  DIS: "Consumer", MCD: "Consumer", SBUX: "Consumer", HD: "Consumer",
  LOW: "Consumer", TGT: "Consumer",
  XOM: "Energy", CVX: "Energy", COP: "Energy",
  BA: "Industrial", CAT: "Industrial", GE: "Industrial",
};

export const SECTOR_COLORS: Record<string, string> = {
  Technology: "bg-sky-400",
  Finance: "bg-amber-400",
  Healthcare: "bg-emerald-400",
  Consumer: "bg-violet-400",
  Energy: "bg-orange-400",
  Industrial: "bg-cyan-400",
  Index: "bg-slate-400",
};

export const VALID_YEARS = [
  2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
  2020, 2021, 2022, 2023, 2024, 2025,
];

export const STARTING_BALANCE = 10000;
export const TOTAL_MONTHS = 12;
export const PRE_HISTORY_MONTHS = 36;
