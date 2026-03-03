"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSprintStore } from "@/lib/store/sprint-store";
import { Button } from "@/components/ui/button";
import { TOTAL_MONTHS } from "@/lib/constants/tickers";

export function NextMonthButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const currentMonth = useSprintStore((s) => s.currentMonth);
  const advanceMonth = useSprintStore((s) => s.advanceMonth);

  const isLastMonth = currentMonth >= TOTAL_MONTHS - 1;
  const label = isLastMonth
    ? "See Your Results"
    : `Advance to Month ${currentMonth + 2}`;

  const handleConfirm = () => {
    advanceMonth();
    setShowConfirm(false);
    if (isLastMonth) {
      router.push("/analysis");
    }
  };

  return (
    <>
      <Button
        variant={isLastMonth ? "success" : "primary"}
        size="lg"
        className="w-full text-base font-bold"
        onClick={() => setShowConfirm(true)}
      >
        {label} →
      </Button>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 id="confirm-dialog-title" className="text-lg font-semibold text-slate-100">
              {isLastMonth ? "Finish Your Sprint?" : "Move to Next Month?"}
            </h3>
            <p className="text-sm text-slate-400">
              {isLastMonth
                ? "This will end your sprint and generate your trading analysis. You can't go back."
                : "All trades for this month are final. You can't go back to previous months."}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant={isLastMonth ? "success" : "primary"}
                className="flex-1"
                onClick={handleConfirm}
              >
                {isLastMonth ? "See Results" : "Next Month"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
