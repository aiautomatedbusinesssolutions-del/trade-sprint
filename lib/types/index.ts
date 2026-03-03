export interface MonthlyBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Holding {
  ticker: string;
  shares: number;
  avgCostBasis: number;
  totalInvested: number;
}

export interface Trade {
  month: number;
  ticker: string;
  side: "buy" | "sell";
  dollarAmount: number;
  priceAtExecution: number;
  shares: number;
  orderIndex: number;
}

export interface SprintData {
  actualYear: number;
  stockData: Record<string, MonthlyBar[]>;
  availableTickers: string[];
}

export interface PortfolioSnapshot {
  month: number;
  totalValue: number;
  cashBalance: number;
  holdingsValue: number;
}

export interface AnalysisResult {
  summary: string;
  psychologyBreakdown: {
    category: string;
    score: number;
    description: string;
  }[];
  strengths: string[];
  improvements: string[];
  traderArchetype: string;
  archetypeDescription: string;
  totalReturn: number;
  totalReturnPercent: number;
}
