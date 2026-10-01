import type { ReactNode } from "react";

interface ListToolbarProps {
  search: ReactNode;
  summary?: ReactNode;
  action?: ReactNode;
}

export function ListToolbar({ search, summary, action }: ListToolbarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="min-w-0 flex-1">{search}</div>
      {summary && (
        <p className="shrink-0 text-muted-foreground text-xs tabular-nums max-sm:hidden">
          {summary}
        </p>
      )}
      {action}
    </div>
  );
}
