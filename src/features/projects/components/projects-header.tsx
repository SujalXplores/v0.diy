import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectsHeaderProps {
  projectCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProjectsHeader({
  projectCount,
  searchQuery,
  onSearchChange,
}: ProjectsHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for a project..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
