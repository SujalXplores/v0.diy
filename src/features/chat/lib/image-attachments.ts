import { createId } from "@/lib/create-id";
import type { AttachmentPayload, ImageAttachment } from "../types";

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function createImageAttachment(
  file: File,
): Promise<ImageAttachment> {
  return {
    id: createId(),
    name: file.name,
    dataUrl: await readAsDataUrl(file),
  };
}

export function toAttachmentPayload(
  attachments: ImageAttachment[],
): AttachmentPayload[] {
  return attachments.map((attachment) => ({ url: attachment.dataUrl }));
}
