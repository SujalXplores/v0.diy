import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  /** Rendered above the card, e.g. a notice explaining the redirect. */
  notice?: ReactNode;
  children: ReactNode;
}

const DOT_GRID_STYLE = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
  backgroundSize: "24px 24px",
};

/** Centered card layout shared by the login and register pages. */
export function AuthCard({
  title,
  description,
  notice,
  children,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={DOT_GRID_STYLE}
      />

      <div className="relative w-full max-w-sm">
        {notice}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-border border-b bg-card px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-semibold text-2xl text-foreground tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">{description}</p>
          </div>

          <div className="bg-muted/30 px-6 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
