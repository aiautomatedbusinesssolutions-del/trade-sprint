"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { LeaderboardEntry } from "@/lib/types";

type FilterMode = "all" | "real" | "practice";

export function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const mockParam =
          filter === "real" ? "exclude" : filter === "practice" ? "only" : "include";
        const res = await fetch(`/api/leaderboard?limit=50&mock=${mockParam}`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const data = await res.json();
        setEntries(data.entries);
      } catch {
        setError("Could not load leaderboard. Try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [filter]);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 justify-center">
        {(["all", "real", "practice"] as FilterMode[]).map((mode) => (
          <Button
            key={mode}
            variant={filter === mode ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter(mode)}
          >
            {mode === "all" ? "All" : mode === "real" ? "Real Data" : "Practice"}
          </Button>
        ))}
      </div>

      {loading && (
        <Card className="text-center py-8">
          <p className="text-sm text-slate-400">Loading leaderboard...</p>
        </Card>
      )}

      {error && (
        <Card className="text-center py-8">
          <p className="text-sm text-rose-400">{error}</p>
        </Card>
      )}

      {!loading && !error && entries.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-slate-400">
            No scores yet. Be the first to submit!
          </p>
        </Card>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <Card
              key={entry.id}
              className={`flex items-center gap-4 ${
                index === 0
                  ? "border-amber-500/30"
                  : index === 1
                    ? "border-slate-400/30"
                    : index === 2
                      ? "border-amber-700/30"
                      : ""
              }`}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center">
                <span
                  className={`text-lg font-bold ${
                    index === 0
                      ? "text-amber-400"
                      : index === 1
                        ? "text-slate-300"
                        : index === 2
                          ? "text-amber-600"
                          : "text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100 truncate">
                    {entry.player_name}
                  </span>
                  {entry.is_mock_data && (
                    <Badge variant="warning">Practice</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{entry.archetype}</span>
                  <span>{entry.year_traded}</span>
                  <span>{entry.trade_count} trades</span>
                </div>
              </div>

              {/* Return */}
              <div className="flex-shrink-0 text-right">
                <p
                  className={`text-sm font-bold ${
                    Number(entry.return_percent) >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {formatPercent(Number(entry.return_percent))}
                </p>
                <p className="text-xs text-slate-500">
                  {formatCurrency(Number(entry.final_value))}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
