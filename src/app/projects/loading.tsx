const SKELETON_IDS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
];

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-border dark:border-input">
      <div className="aspect-[3/2] animate-pulse bg-gray-200 dark:bg-zinc-800" />
      <div className="p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="border-border border-b dark:border-input">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
          </div>
          <div className="h-10 w-full max-w-md animate-pulse rounded bg-gray-200 dark:bg-zinc-800" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <SkeletonCard key={id} />
          ))}
        </div>
      </main>
    </div>
  );
}
