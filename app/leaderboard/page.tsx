import type { Metadata } from "next";
import { LeaderboardTable } from "@/components/screens/leaderboard-table";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See how your trading compares to other TradeSprint players.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-4 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-6 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-100">Leaderboard</h1>
          <p className="text-sm text-slate-400">
            Top traders ranked by total return percentage.
          </p>
        </div>
        <LeaderboardTable />
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Start a Sprint
          </a>
        </div>
      </div>
    </div>
  );
}
