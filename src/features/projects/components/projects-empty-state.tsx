"use client";

import { Folder01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { NewProjectButton } from "./new-project-button";

export function ProjectsEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Describe what you want to build. Every app v0 generates lands here
          with a snapshot of its preview.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <NewProjectButton />
      </EmptyContent>
    </Empty>
  );
}

interface ProjectsNoResultsProps {
  query: string;
  onClear: () => void;
}

export function ProjectsNoResults({ query, onClear }: ProjectsNoResultsProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>No projects match &ldquo;{query}&rdquo;</EmptyTitle>
        <EmptyDescription>
          Check the spelling or try another name.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          Clear search
        </Button>
      </EmptyContent>
    </Empty>
  );
}
