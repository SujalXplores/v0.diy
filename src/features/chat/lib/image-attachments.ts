import type { FileUIPart } from "ai";
import { createId } from "@/lib/create-id";
import {
  MAX_ATTACHMENT_URL_LENGTH,
  MAX_ATTACHMENTS,
  MAX_SOURCE_IMAGE_BYTES,
  MAX_TOTAL_ATTACHMENT_URL_LENGTH,
} from "@/lib/v0-models";

export interface ImageAttachment {
  id: string;
  name: string;
  dataUrl: string;
  mediaType: string;
}

const MAX_DIMENSION = 1600;
const OUTPUT_TYPE = "image/webp";
const OUTPUT_QUALITY = 0.86;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function encodeImage(file: File): Promise<{ url: string; type: string }> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return { url: await readAsDataUrl(file), type: file.type };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return { url: await readAsDataUrl(file), type: file.type };
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: OUTPUT_TYPE,
    quality: OUTPUT_QUALITY,
  });
  return { url: await readAsDataUrl(blob), type: OUTPUT_TYPE };
}

export interface AddImagesResult {
  added: ImageAttachment[];
  rejected: string[];
}

export async function createImageAttachments(
  files: File[],
  existing: readonly ImageAttachment[],
): Promise<AddImagesResult> {
  const added: ImageAttachment[] = [];
  const rejected: string[] = [];
  let totalLength = existing.reduce(
    (sum, item) => sum + item.dataUrl.length,
    0,
  );

  for (const file of files) {
    if (!isImageFile(file)) {
      rejected.push(`${file.name} isn't an image`);
      continue;
    }
    if (existing.length + added.length >= MAX_ATTACHMENTS) {
      rejected.push(`You can attach up to ${MAX_ATTACHMENTS} images`);
      break;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      rejected.push(`${file.name} is too large`);
      continue;
    }

    try {
      const { url, type } = await encodeImage(file);
      if (url.length > MAX_ATTACHMENT_URL_LENGTH) {
        rejected.push(`${file.name} is too large`);
        continue;
      }
      if (totalLength + url.length > MAX_TOTAL_ATTACHMENT_URL_LENGTH) {
        rejected.push("Attachments are too large in total");
        break;
      }
      totalLength += url.length;
      added.push({
        id: createId(),
        name: file.name || "Pasted image",
        dataUrl: url,
        mediaType: type,
      });
    } catch {
      rejected.push(`${file.name} couldn't be read`);
    }
  }

  return { added, rejected };
}

export function toFileParts(
  attachments: readonly ImageAttachment[],
): FileUIPart[] {
  return attachments.map((attachment) => ({
    type: "file",
    url: attachment.dataUrl,
    mediaType: attachment.mediaType,
    filename: attachment.name,
  }));
}
