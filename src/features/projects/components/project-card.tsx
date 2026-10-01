"use client";

import { ArrowUpRight01Icon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getPrivacyOption } from "@/features/chats/lib/chat-privacy";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { cn } from "@/lib/utils";
import type { Project } from "../types";

interface ProjectCardProps {
  project: Project;
}

function getMonogram(name: string): string {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?"
  );
}

function PreviewThumbnail({ url, name }: { url: string; name: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <iframe
      src={url}
      title={`Preview of ${name}`}
      tabIndex={-1}
      aria-hidden="true"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
      onLoad={() => setIsLoaded(true)}
      className={cn(
        "pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25 border-0 bg-white opacity-0 transition-opacity duration-500",
        isLoaded && "opacity-100",
      )}
    />
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const monogram = getMonogram(project.name);
  const privacy = getPrivacyOption(project.privacy);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-[box-shadow] hover:shadow-md hover:ring-foreground/20 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring/50">
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-dot-grid bg-muted/40">
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-semibold text-4xl text-muted-foreground/30 tracking-tight"
        >
          {monogram}
        </span>
        {project.previewUrl && (
          <PreviewThumbnail url={project.previewUrl} name={project.name} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        {project.vercelProjectId && (
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm"
          >
            <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} />
            On Vercel
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 p-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted font-semibold text-[0.6875rem] text-muted-foreground"
        >
          {monogram}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-sm">
            <Link
              href={`/chats/${encodeURIComponent(project.id)}`}
              className="outline-none after:absolute after:inset-0 after:content-['']"
            >
              {project.name}
            </Link>
          </h3>
          <p className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs">
            <HugeiconsIcon
              icon={privacy.icon}
              strokeWidth={2}
              className="size-3 shrink-0"
            />
            <span>{privacy.label}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              Edited{" "}
              <time dateTime={project.updatedAt} suppressHydrationWarning>
                {formatRelativeTime(project.updatedAt)}
              </time>
            </span>
          </p>
        </div>
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          strokeWidth={2}
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-[opacity,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-has-[a:focus-visible]:opacity-100"
        />
      </div>
    </article>
  );
}
