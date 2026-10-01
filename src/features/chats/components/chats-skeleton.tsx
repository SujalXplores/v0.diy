import { Item, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = [
  { id: "sk-1", width: "w-2/5" },
  { id: "sk-2", width: "w-1/3" },
  { id: "sk-3", width: "w-1/2" },
  { id: "sk-4", width: "w-1/4" },
  { id: "sk-5", width: "w-2/5" },
];

export function ChatsSkeleton() {
  return (
    <div aria-busy="true" className="animate-delayed-reveal">
      <span className="sr-only">Loading chats</span>
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-7 w-full max-w-sm" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="mb-2 h-4 w-20" />
      <ItemGroup>
        {ROWS.map(({ id, width }) => (
          <Item key={id} variant="outline" size="sm">
            <ItemMedia>
              <Skeleton className="size-4" />
            </ItemMedia>
            <ItemContent className="gap-1.5">
              <Skeleton className={`h-3.5 ${width}`} />
              <Skeleton className="h-3 w-28" />
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
