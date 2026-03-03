import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "success" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border-sky-500/20",
  success: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20",
  danger: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20",
  ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
