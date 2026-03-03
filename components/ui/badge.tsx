import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "danger" | "warning" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400",
  danger: "bg-rose-500/10 text-rose-400",
  warning: "bg-amber-500/10 text-amber-400",
  neutral: "bg-sky-500/10 text-sky-400",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
