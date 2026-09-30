import { XIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PromptInputAttachment {
  id: string;
  name: string;
  dataUrl: string;
}

export interface PromptInputImagePreviewProps {
  attachments: PromptInputAttachment[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function PromptInputImagePreview({
  attachments,
  onRemove,
  className,
}: PromptInputImagePreviewProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-2 p-2", className)}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="group relative overflow-hidden rounded-lg border bg-muted"
        >
          <Image
            src={attachment.dataUrl}
            alt={attachment.name}
            width={64}
            height={64}
            className="h-16 w-16 object-cover"
            unoptimized
          />
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              type="button"
              aria-label={`Remove ${attachment.name}`}
            >
              <XIcon className="size-3" />
            </button>
          )}
          <div className="absolute right-0 bottom-0 left-0 truncate bg-black/50 p-1 text-white text-xs">
            {attachment.name}
          </div>
        </div>
      ))}
    </div>
  );
}
