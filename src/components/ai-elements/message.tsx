import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export function Message({ className, from, ...props }: MessageProps) {
  return (
    <div
      className={cn(
        "group flex w-full items-end justify-end gap-2 py-4",
        from === "user"
          ? "is-user [&>div]:max-w-[80%]"
          : "is-assistant flex-row-reverse justify-end [&>div]:max-w-full",
        className,
      )}
      {...props}
    />
  );
}
