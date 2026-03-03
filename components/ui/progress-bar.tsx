import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: "sky" | "emerald" | "amber" | "rose";
}

const colorStyles = {
  sky: "bg-sky-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

export function ProgressBar({
  value,
  max,
  className,
  color = "sky",
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={cn("h-1.5 w-full rounded-full bg-slate-800", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorStyles[color])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
