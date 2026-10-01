import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground font-bold font-mono text-[0.625rem] text-background tracking-tighter",
        className,
      )}
    >
      v0
    </span>
  );
}

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-semibold text-sm tracking-tight">v0.diy</span>
    </span>
  );
}
