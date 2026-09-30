import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** A file name with a file icon, used in code project listings. */
export function FileEntry({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-black text-sm dark:text-white">
      <FileIcon />
      <span className="font-mono">{name}</span>
    </div>
  );
}
