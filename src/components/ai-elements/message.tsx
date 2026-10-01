import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full py-3 text-sm",
        from === "user"
          ? "is-user justify-end [&>div]:max-w-[85%] [&>div]:rounded-2xl [&>div]:rounded-br-md [&>div]:bg-muted [&>div]:px-3.5 [&>div]:py-2.5 [&_p:last-child]:mb-0"
          : "is-assistant justify-start [&>div]:w-full [&>div]:min-w-0",
        className,
      )}
      {...props}
    />
  );
}
