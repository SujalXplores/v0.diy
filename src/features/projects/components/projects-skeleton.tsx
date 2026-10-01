import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CARDS = [
  { id: "sk-1", width: "w-3/4" },
  { id: "sk-2", width: "w-1/2" },
  { id: "sk-3", width: "w-2/3" },
  { id: "sk-4", width: "w-3/5" },
];

export function ProjectsSkeleton() {
  return (
    <div aria-busy="true" className="animate-delayed-reveal">
      <span className="sr-only">Loading projects</span>
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-7 w-full max-w-sm" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CARDS.map(({ id, width }) => (
          <Card key={id} className="pt-0">
            <Skeleton className="aspect-[3/2] rounded-none" />
            <CardHeader className="gap-1.5">
              <Skeleton className={`h-4 ${width}`} />
              <Skeleton className="h-3 w-1/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
