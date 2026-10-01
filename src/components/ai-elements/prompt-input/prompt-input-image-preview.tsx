import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
    <div className={cn("flex flex-wrap gap-2 px-3 pt-3", className)}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="group relative size-16 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10"
          title={attachment.name}
        >
          <Image
            src={attachment.dataUrl}
            alt={attachment.name}
            width={64}
            height={64}
            className="size-16 object-cover"
            unoptimized
          />
          {onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-foreground/10 transition-opacity focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
              type="button"
              aria-label={`Remove ${attachment.name}`}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-3"
              />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
