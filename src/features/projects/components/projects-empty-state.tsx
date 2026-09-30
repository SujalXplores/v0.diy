import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ProjectsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-4 font-medium text-gray-900 dark:text-white">
        No projects yet
      </h3>
      <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
        Get started by creating your first project.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Link>
      </Button>
    </div>
  );
}
