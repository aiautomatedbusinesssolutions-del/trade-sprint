import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100",
          "placeholder:text-slate-500 min-h-[44px]",
          "focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50",
          "transition-colors",
          icon && "pl-10",
          className
        )}
        {...props}
      />
    </div>
  );
}
