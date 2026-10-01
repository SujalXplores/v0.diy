import { ArrowUpRight01Icon, Rocket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format-relative-time";
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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/chats/${encodeURIComponent(project.id)}`}
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Card className="pt-0">
        <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden border-b bg-dot-grid bg-muted/40">
          <span
            aria-hidden="true"
            className="font-semibold text-4xl text-muted-foreground/40 tracking-tight transition-transform duration-500 group-hover:scale-110"
          >
            {getMonogram(project.name)}
          </span>
          {project.vercelProjectId && (
            <Badge
              variant="outline"
              className="absolute top-2 left-2 bg-background"
            >
              <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} />
              On Vercel
            </Badge>
          )}
        </div>
        <CardHeader>
          <CardTitle className="truncate">{project.name}</CardTitle>
          <CardDescription>
            Edited{" "}
            <time dateTime={project.updatedAt} suppressHydrationWarning>
              {formatRelativeTime(project.updatedAt)}
            </time>
          </CardDescription>
          <CardAction>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              strokeWidth={2}
              className="size-4 text-muted-foreground opacity-0 transition-[opacity,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </CardAction>
        </CardHeader>
      </Card>
    </Link>
  );
}
