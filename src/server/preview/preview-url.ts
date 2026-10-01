import "server-only";

import { headers } from "next/headers";
import { getPreviewOrigin, PREVIEW_PATH_PREFIX } from "./origins";
import { createPreviewToken } from "./token";

export interface ChatPreviewTarget {
  url: string;
  origin: string;
}

export async function getAppOrigin(): Promise<string> {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) {
    return new URL(configured).origin;
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  return new URL(`${protocol}://${host}`).origin;
}

export async function createChatPreviewTargets(
  userId: string,
): Promise<((chatId: string) => ChatPreviewTarget) | null> {
  const appOrigin = await getAppOrigin();
  const previewOrigin = getPreviewOrigin(appOrigin);

  if (!previewOrigin) {
    return null;
  }

  return (chatId) => {
    const token = createPreviewToken({ chatId, userId, appOrigin });
    return {
      url: `${previewOrigin}${PREVIEW_PATH_PREFIX}/${token}`,
      origin: previewOrigin,
    };
  };
}

export async function getChatPreviewTarget(
  chatId: string,
  userId: string,
): Promise<ChatPreviewTarget | null> {
  const toTarget = await createChatPreviewTargets(userId);
  return toTarget?.(chatId) ?? null;
}
