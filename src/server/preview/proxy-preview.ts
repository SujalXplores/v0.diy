import "server-only";

import { type ChatsGetPreviewResponse, fetchPreview, type V0Client } from "v0";
import { getChatOwnership } from "@/server/db/queries/chat-ownerships";
import { createUserV0Client, getUserV0ApiKey } from "@/server/v0/client";
import { PREVIEW_PATH_PREFIX } from "./origins";
import { type PreviewTokenPayload, verifyPreviewToken } from "./token";

export const LOADING_SEGMENT = "__v0diy_loading";

const REFRESH_MARGIN_MS = 60_000;
const MAX_CACHED_PREVIEWS = 500;

interface CachedPreview {
  preview: NonNullable<ChatsGetPreviewResponse>;
  expiresAt: number;
}

const previewCache = new Map<string, CachedPreview>();
const trustedHostsByUser = new Set<string>();

function cacheKey({ userId, chatId }: PreviewTokenPayload): string {
  return `${userId}:${chatId}`;
}

function remember(key: string, preview: NonNullable<ChatsGetPreviewResponse>) {
  previewCache.delete(key);
  previewCache.set(key, {
    preview,
    expiresAt: new Date(preview.expiresAt).getTime(),
  });
  if (previewCache.size > MAX_CACHED_PREVIEWS) {
    const oldest = previewCache.keys().next().value;
    if (oldest) {
      previewCache.delete(oldest);
    }
  }
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
  );
}

async function ensureTrustedPreviewHost(
  v0: V0Client,
  userId: string,
  hostname: string,
): Promise<void> {
  const key = `${userId}:${hostname}`;
  if (isLocalHostname(hostname) || trustedHostsByUser.has(key)) {
    return;
  }

  const current = await v0.settings.getPreviewHosts();
  if (current.error !== undefined || !current.data) {
    throw new Error("Couldn't read v0's trusted preview hosts");
  }

  const hosts = current.data.hosts;
  if (!hosts.some((pattern) => matchesHostPattern(hostname, pattern))) {
    const updated = await v0.settings.setPreviewHosts({
      hosts: [...hosts, hostname],
    });
    if (updated.error !== undefined) {
      throw new Error("Couldn't add this site to v0's trusted preview hosts");
    }
  }
  trustedHostsByUser.add(key);
}

function matchesHostPattern(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase();
  const value = pattern.toLowerCase();

  if (value.startsWith("**.")) {
    const suffix = value.slice(3);
    return host.endsWith(`.${suffix}`);
  }
  if (value.startsWith("*.")) {
    const suffix = value.slice(2);
    return (
      host.endsWith(`.${suffix}`) &&
      !host.slice(0, -suffix.length - 1).includes(".")
    );
  }
  return host === value;
}

async function loadPreview(
  payload: PreviewTokenPayload,
  hostname: string,
): Promise<ChatsGetPreviewResponse> {
  const key = cacheKey(payload);
  const cached = previewCache.get(key);
  if (cached && cached.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return cached.preview;
  }

  const ownership = await getChatOwnership(payload.chatId);
  if (ownership?.user_id !== payload.userId) {
    throw new PreviewAccessError(404, "This preview no longer exists.");
  }

  const apiKey = await getUserV0ApiKey(payload.userId);
  if (!apiKey) {
    throw new PreviewAccessError(428, "Add your v0 API key to see previews.");
  }

  const v0 = createUserV0Client(apiKey);
  await ensureTrustedPreviewHost(v0, payload.userId, hostname);

  const result = await v0.chats.getPreview({ chatId: payload.chatId });
  if (result.error !== undefined) {
    throw new PreviewAccessError(
      result.response?.status === 404 ? 404 : 502,
      "v0 couldn't load this preview.",
    );
  }

  const preview = result.data ?? null;
  if (preview) {
    remember(key, preview);
  } else {
    previewCache.delete(key);
  }
  return preview;
}

class PreviewAccessError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function htmlPage(body: string, init: ResponseInit, head = ""): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}<style>html,body{height:100%;margin:0}body{display:flex;align-items:center;justify-content:center;font:13px system-ui,sans-serif;color:#737373;background:#fafafa}@media (prefers-color-scheme:dark){body{background:#0a0a0a;color:#a3a3a3}}</style></head><body>${body}</body></html>`,
    {
      ...init,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        ...init.headers,
      },
    },
  );
}

function loadingPage(payload: PreviewTokenPayload, returnTo: string): Response {
  const origin = JSON.stringify(payload.appOrigin).replaceAll("<", "\\u003c");
  const notify = `<script>const n=()=>parent.postMessage({type:"v0diy-preview-loading"},${origin});n();setInterval(n,500)</script>`;
  return htmlPage(
    "Starting preview…",
    { headers: securityHeaders(payload) },
    `<meta http-equiv="refresh" content="2;url=${escapeHtml(returnTo)}">${notify}`,
  );
}

function securityHeaders(payload: PreviewTokenPayload): Record<string, string> {
  return {
    "Content-Security-Policy": `frame-ancestors ${payload.appOrigin}`,
    "X-Robots-Tag": "noindex, nofollow",
  };
}

function getPublicUrl(request: Request): URL {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    url.host = host;
  }
  const protocol = request.headers.get("x-forwarded-proto");
  if (protocol) {
    url.protocol = `${protocol}:`;
  }
  return url;
}

export async function proxyPreviewRequest(
  request: Request,
  token: string,
  path: string[],
): Promise<Response> {
  const payload = verifyPreviewToken(token);
  if (!payload) {
    return htmlPage(
      "This preview link expired. Reload the chat to get a new one.",
      {
        status: 403,
      },
    );
  }

  const basePath = `${PREVIEW_PATH_PREFIX}/${token}`;
  const url = getPublicUrl(request);

  if (path[0] === LOADING_SEGMENT) {
    const requested = url.searchParams.get("returnTo") ?? basePath;
    const returnTo =
      requested === basePath || requested.startsWith(`${basePath}/`)
        ? requested
        : basePath;
    return loadingPage(payload, returnTo);
  }

  let preview: ChatsGetPreviewResponse;
  try {
    preview = await loadPreview(payload, url.hostname);
  } catch (error) {
    if (error instanceof PreviewAccessError) {
      return htmlPage(escapeHtml(error.message), {
        status: error.status,
        headers: securityHeaders(payload),
      });
    }
    console.error("Preview proxy error:", error);
    return htmlPage("The preview couldn't be loaded. Try refreshing.", {
      status: 502,
      headers: securityHeaders(payload),
    });
  }

  const fallbackUrl = new URL(`${basePath}/${LOADING_SEGMENT}`, url.origin);
  fallbackUrl.searchParams.set("returnTo", url.pathname + url.search);

  const upstream = await fetchPreview({
    request,
    preview,
    path,
    fallbackUrl,
    onPreviewRefresh: () => {
      previewCache.delete(cacheKey(payload));
    },
  });

  const response = new Response(upstream.body, upstream);
  rewriteLocation(response, basePath, preview?.url);
  for (const [name, value] of Object.entries(securityHeaders(payload))) {
    response.headers.append(name, value);
  }
  return response;
}

function rewriteLocation(
  response: Response,
  basePath: string,
  previewUrl: string | undefined,
): void {
  const location = response.headers.get("location");
  if (!location) {
    return;
  }

  if (location.startsWith("/") && !location.startsWith("//")) {
    if (!location.startsWith(`${basePath}/`) && location !== basePath) {
      response.headers.set("location", `${basePath}${location}`);
    }
    return;
  }

  if (!previewUrl) {
    return;
  }
  try {
    const target = new URL(location);
    if (target.origin === new URL(previewUrl).origin) {
      response.headers.set(
        "location",
        `${basePath}${target.pathname}${target.search}${target.hash}`,
      );
    }
  } catch {
    // Not a URL we can map; leave it as is.
  }
}
