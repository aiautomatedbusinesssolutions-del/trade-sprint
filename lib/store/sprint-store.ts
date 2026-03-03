import { create } from "zustand";
import type { Holding, Trade, MonthlyBar, SprintData, PortfolioSnapshot } from "@/lib/types";
import {
  getStockPrice,
  calculateMonthlyChange,
  calculatePortfolioValue,
  calculateHoldingPnL,
  calculateHoldingValue,
  getTrendingStocks,
} from "@/lib/utils/calculations";
import { STARTING_BALANCE, TOTAL_MONTHS } from "@/lib/constants/tickers";

export type SprintStatus = "idle" | "loading" | "trading" | "finished";

interface SprintState {
  status: SprintStatus;
  currentMonth: number;
  actualYear: number | null;
  cashBalance: number;
  holdings: Record<string, Holding>;
  stockData: Record<string, MonthlyBar[]>;
  availableTickers: string[];
  tradeHistory: Trade[];
  portfolioSnapshots: PortfolioSnapshot[];
  selectedTicker: string | null;
}

interface SprintActions {
  setLoading: () => void;
  initializeSprint: (data: SprintData) => void;
  selectTicker: (ticker: string | null) => void;
  executeTrade: (ticker: string, dollarAmount: number, side: "buy" | "sell", reason?: string) => string | null;
  advanceMonth: () => void;
  reset: () => void;
  getPrice: (ticker: string, month?: number) => number;
  getChange: (ticker: string, month?: number) => number;
  getPortfolioValue: () => number;
  getHoldingValue: (ticker: string) => number;
  getHoldingPnL: (ticker: string) => { absolute: number; percent: number };
  getTrending: () => { ticker: string; changePercent: number }[];
}

const initialState: SprintState = {
  status: "idle",
  currentMonth: 0,
  actualYear: null,
  cashBalance: STARTING_BALANCE,
  holdings: {},
  stockData: {},
  availableTickers: [],
  tradeHistory: [],
  portfolioSnapshots: [],
  selectedTicker: null,
};

export const useSprintStore = create<SprintState & SprintActions>()((set, get) => ({
  ...initialState,

  setLoading: () => set({ status: "loading" }),

  initializeSprint: (data: SprintData) => {
    const snapshot: PortfolioSnapshot = {
      month: 0,
      totalValue: STARTING_BALANCE,
      cashBalance: STARTING_BALANCE,
      holdingsValue: 0,
    };
    set({
      status: "trading",
      currentMonth: 0,
      actualYear: data.actualYear,
      cashBalance: STARTING_BALANCE,
      holdings: {},
      stockData: data.stockData,
      availableTickers: data.availableTickers,
      tradeHistory: [],
      portfolioSnapshots: [snapshot],
      selectedTicker: data.availableTickers[0] ?? null,
    });
  },

  selectTicker: (ticker) => set({ selectedTicker: ticker }),

  executeTrade: (ticker, dollarAmount, side, reason) => {
    const state = get();
    const price = getStockPrice(state.stockData, ticker, state.currentMonth);
    if (price <= 0) return "Stock data not available";

    const shares = dollarAmount / price;

    if (side === "buy") {
      if (dollarAmount > state.cashBalance) return "Not enough cash";
      if (dollarAmount <= 0) return "Enter an amount";

      const existing = state.holdings[ticker];
      const newShares = (existing?.shares ?? 0) + shares;
      const newTotalInvested = (existing?.totalInvested ?? 0) + dollarAmount;

      const trade: Trade = {
        month: state.currentMonth,
        ticker,
        side: "buy",
        dollarAmount,
        priceAtExecution: price,
        shares,
        orderIndex: state.tradeHistory.length,
        reason: reason?.trim() || undefined,
      };

      set({
        cashBalance: state.cashBalance - dollarAmount,
        holdings: {
          ...state.holdings,
          [ticker]: {
            ticker,
            shares: newShares,
            avgCostBasis: newTotalInvested / newShares,
            totalInvested: newTotalInvested,
          },
        },
        tradeHistory: [...state.tradeHistory, trade],
      });

      return null;
    } else {
      const existing = state.holdings[ticker];
      if (!existing || existing.shares <= 0) return "You don't own this stock";

      const maxSellValue = existing.shares * price;
      const actualAmount = Math.min(dollarAmount, maxSellValue);
      const sellShares = actualAmount / price;

      if (actualAmount <= 0) return "Enter an amount";

      const remainingShares = existing.shares - sellShares;
      const remainingInvested = existing.totalInvested * (remainingShares / existing.shares);

      const trade: Trade = {
        month: state.currentMonth,
        ticker,
        side: "sell",
        dollarAmount: actualAmount,
        priceAtExecution: price,
        shares: sellShares,
        orderIndex: state.tradeHistory.length,
        reason: reason?.trim() || undefined,
      };

      const newHoldings = { ...state.holdings };
      if (remainingShares < 0.0001) {
        delete newHoldings[ticker];
      } else {
        newHoldings[ticker] = {
          ticker,
          shares: remainingShares,
          avgCostBasis: existing.avgCostBasis,
          totalInvested: remainingInvested,
        };
      }

      set({
        cashBalance: state.cashBalance + actualAmount,
        holdings: newHoldings,
        tradeHistory: [...state.tradeHistory, trade],
      });

      return null;
    }
  },

  advanceMonth: () => {
    const state = get();
    const nextMonth = state.currentMonth + 1;

    if (nextMonth >= TOTAL_MONTHS) {
      // Sprint finished
      const finalValue = calculatePortfolioValue(
        state.holdings,
        state.stockData,
        state.currentMonth,
        state.cashBalance
      );
      const snapshot: PortfolioSnapshot = {
        month: state.currentMonth,
        totalValue: finalValue,
        cashBalance: state.cashBalance,
        holdingsValue: finalValue - state.cashBalance,
      };
      set({
        status: "finished",
        portfolioSnapshots: [...state.portfolioSnapshots, snapshot],
      });
      return;
    }

    // Take snapshot at new month
    const totalValue = calculatePortfolioValue(
      state.holdings,
      state.stockData,
      nextMonth,
      state.cashBalance
    );
    const snapshot: PortfolioSnapshot = {
      month: nextMonth,
      totalValue,
      cashBalance: state.cashBalance,
      holdingsValue: totalValue - state.cashBalance,
    };

    set({
      currentMonth: nextMonth,
      portfolioSnapshots: [...state.portfolioSnapshots, snapshot],
    });
  },

  reset: () => set(initialState),

  getPrice: (ticker, month) => {
    const state = get();
    return getStockPrice(state.stockData, ticker, month ?? state.currentMonth);
  },

  getChange: (ticker, month) => {
    const state = get();
    const bars = state.stockData[ticker];
    if (!bars) return 0;
    return calculateMonthlyChange(bars, month ?? state.currentMonth);
  },

  getPortfolioValue: () => {
    const state = get();
    return calculatePortfolioValue(
      state.holdings,
      state.stockData,
      state.currentMonth,
      state.cashBalance
    );
  },

  getHoldingValue: (ticker) => {
    const state = get();
    const holding = state.holdings[ticker];
    if (!holding) return 0;
    const price = getStockPrice(state.stockData, ticker, state.currentMonth);
    return calculateHoldingValue(holding, price);
  },

  getHoldingPnL: (ticker) => {
    const state = get();
    const holding = state.holdings[ticker];
    if (!holding) return { absolute: 0, percent: 0 };
    const price = getStockPrice(state.stockData, ticker, state.currentMonth);
    return calculateHoldingPnL(holding, price);
  },

  getTrending: () => {
    const state = get();
    return getTrendingStocks(state.stockData, state.currentMonth);
  },
}));
