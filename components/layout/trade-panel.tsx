"use client";

import { useState, useMemo } from "react";
import { useSprintStore } from "@/lib/store/sprint-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { TICKER_NAMES } from "@/lib/constants/tickers";

export function TradePanel() {
  const [search, setSearch] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedTicker = useSprintStore((s) => s.selectedTicker);
  const availableTickers = useSprintStore((s) => s.availableTickers);
  const cashBalance = useSprintStore((s) => s.cashBalance);
  const holdings = useSprintStore((s) => s.holdings);
  const selectTicker = useSprintStore((s) => s.selectTicker);
  const executeTrade = useSprintStore((s) => s.executeTrade);
  const getPrice = useSprintStore((s) => s.getPrice);
  const getChange = useSprintStore((s) => s.getChange);

  const filteredTickers = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toUpperCase().trim();
    return availableTickers
      .filter(
        (t) =>
          t.includes(q) ||
          (TICKER_NAMES[t]?.toUpperCase().includes(q) ?? false)
      )
      .slice(0, 6);
  }, [search, availableTickers]);

  const currentPrice = selectedTicker ? getPrice(selectedTicker) : 0;
  const change = selectedTicker ? getChange(selectedTicker) : 0;
  const isUp = change >= 0;
  const holding = selectedTicker ? holdings[selectedTicker] : undefined;

  const handleTrade = () => {
    if (!selectedTicker) return;
    const dollarAmount = parseFloat(amount);
    if (isNaN(dollarAmount) || dollarAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    const result = executeTrade(selectedTicker, dollarAmount, side);
    if (result) {
      setError(result);
      setSuccess(null);
    } else {
      setError(null);
      const shares = dollarAmount / currentPrice;
      setSuccess(
        `${side === "buy" ? "Bought" : "Sold"} ${shares.toFixed(2)} shares of ${selectedTicker}`
      );
      setAmount("");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const quickAmounts = [100, 500, 1000];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Trade
        </h3>
        <div className="text-right">
          <p className="text-xs text-slate-500">Available Cash</p>
          <p className="text-sm font-bold text-emerald-400">
            {formatCurrency(cashBalance)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setError(null);
          }}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
        {filteredTickers.length > 0 && search.trim() && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg">
            {filteredTickers.map((ticker) => (
              <button
                key={ticker}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center justify-between"
                onClick={() => {
                  selectTicker(ticker);
                  setSearch("");
                  setError(null);
                }}
              >
                <span>
                  <span className="font-medium text-slate-100">{ticker}</span>
                  <span className="text-slate-500 ml-2 text-xs">
                    {TICKER_NAMES[ticker]}
                  </span>
                </span>
                <span className="text-slate-400 text-xs">
                  {formatCurrency(getPrice(ticker))}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected stock info */}
      {selectedTicker && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-100">{selectedTicker}</p>
              <p className="text-xs text-slate-500">
                {TICKER_NAMES[selectedTicker]}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-100">
                {formatCurrency(currentPrice)}
              </p>
              <p
                className={`text-xs font-medium ${
                  isUp ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatPercent(change)}
              </p>
            </div>
          </div>

          {holding && (
            <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-xs text-slate-400">
              You own {holding.shares.toFixed(4)} shares (
              {formatCurrency(holding.shares * currentPrice)})
            </div>
          )}

          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={side === "buy" ? "success" : "ghost"}
              size="sm"
              onClick={() => {
                setSide("buy");
                setError(null);
              }}
            >
              Buy
            </Button>
            <Button
              variant={side === "sell" ? "danger" : "ghost"}
              size="sm"
              onClick={() => {
                setSide("sell");
                setError(null);
              }}
            >
              Sell
            </Button>
          </div>

          {/* Amount input */}
          <Input
            type="number"
            placeholder="Enter dollar amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            icon={<span className="text-sm font-medium">$</span>}
          />

          {/* Quick amounts */}
          <div className="flex gap-2">
            {quickAmounts.map((qa) => (
              <Button
                key={qa}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => {
                  setAmount(qa.toString());
                  setError(null);
                }}
              >
                ${qa}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                if (side === "buy") {
                  setAmount(Math.floor(cashBalance).toString());
                } else if (holding) {
                  setAmount(
                    Math.floor(holding.shares * currentPrice).toString()
                  );
                }
                setError(null);
              }}
            >
              Max
            </Button>
          </div>

          {/* Execute */}
          <Button
            variant={side === "buy" ? "success" : "danger"}
            className="w-full"
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {side === "buy" ? "Buy" : "Sell"} {selectedTicker}
          </Button>

          {/* Feedback */}
          {error && (
            <p className="text-xs text-rose-400 text-center">{error}</p>
          )}
          {success && (
            <p className="text-xs text-emerald-400 text-center">{success}</p>
          )}
        </>
      )}

      {!selectedTicker && (
        <p className="text-sm text-slate-500 text-center py-4">
          Search for a stock above to start trading
        </p>
      )}
    </Card>
  );
}
