"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LeaderboardSubmitProps {
  returnPercent: number;
  finalValue: number;
  tradeCount: number;
  yearTraded: number;
  archetype: string;
  isMockData: boolean;
}

type SubmitState = "idle" | "submitting" | "submitted" | "error";

export function LeaderboardSubmit({
  returnPercent,
  finalValue,
  tradeCount,
  yearTraded,
  archetype,
  isMockData,
}: LeaderboardSubmitProps) {
  const [playerName, setPlayerName] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    setSubmitState("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim(),
          returnPercent,
          finalValue,
          tradeCount,
          yearTraded,
          archetype,
          isMockData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitState("submitted");
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (submitState === "submitted") {
    return (
      <Card className="text-center space-y-2 border-emerald-500/20 animate-fade-in-up">
        <p className="text-sm text-emerald-400 font-medium">
          Score submitted to the leaderboard!
        </p>
        <a
          href="/leaderboard"
          className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2"
        >
          View Leaderboard
        </a>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 border-sky-500/20 animate-fade-in-up animate-delay-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
          Submit to Leaderboard
        </h3>
        {isMockData && <Badge variant="warning">Practice Data</Badge>}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Your name"
          aria-label="Player name for leaderboard"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 30))}
          maxLength={30}
          disabled={submitState === "submitting"}
        />
        <Button
          variant="success"
          onClick={handleSubmit}
          disabled={submitState === "submitting" || !playerName.trim()}
        >
          {submitState === "submitting" ? "..." : "Submit"}
        </Button>
      </div>
      {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
    </Card>
  );
}
