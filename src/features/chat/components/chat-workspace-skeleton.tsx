import { Skeleton } from "@/components/ui/skeleton";

export function ChatWorkspaceSkeleton() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-0 flex-1 animate-delayed-reveal"
    >
      <span className="sr-only">Loading chat</span>
      <div className="flex w-full flex-col md:w-[35%] md:border-r">
        <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6">
          <div className="flex justify-end">
            <Skeleton className="h-9 w-3/5 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="px-4 pt-1 pb-4">
          <Skeleton className="mx-auto h-28 w-full max-w-3xl rounded-xl" />
        </div>
      </div>
      <div className="hidden flex-1 flex-col md:flex">
        <div className="flex h-11 items-center gap-2 border-b px-2">
          <Skeleton className="size-7" />
          <Skeleton className="h-7 flex-1" />
          <Skeleton className="size-7" />
        </div>
        <div className="flex-1 bg-dot-grid bg-muted/30" />
      </div>
    </div>
  );
}
