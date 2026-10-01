"use client";

import { code } from "@streamdown/code";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<typeof Streamdown>;

const PLUGINS = { code };

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:pl-4",
        className,
      )}
      plugins={PLUGINS}
      {...props}
    />
  ),
  (prev, next) =>
    prev.children === next.children &&
    prev.isAnimating === next.isAnimating &&
    prev.mode === next.mode,
);

Response.displayName = "Response";
