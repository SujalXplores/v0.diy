import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export interface PreviewTokenPayload {
  chatId: string;
  userId: string;
  appOrigin: string;
  expiresAt: number;
}

interface WirePayload {
  c: string;
  u: string;
  o: string;
  e: number;
}

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

function getSigningKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required to sign preview URLs");
  }
  return createHash("sha256").update(`v0.diy preview token:${secret}`).digest();
}

function sign(data: string): string {
  return createHmac("sha256", getSigningKey()).update(data).digest("base64url");
}

export function createPreviewToken(
  payload: Omit<PreviewTokenPayload, "expiresAt">,
): string {
  const wire: WirePayload = {
    c: payload.chatId,
    u: payload.userId,
    o: payload.appOrigin,
    e: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(wire)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifyPreviewToken(token: string): PreviewTokenPayload | null {
  const [data, signature, ...rest] = token.split(".");
  if (!(data && signature) || rest.length > 0) {
    return null;
  }

  const expected = Buffer.from(sign(data));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const wire = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as WirePayload;

    if (wire.e * 1000 < Date.now()) {
      return null;
    }
    return {
      chatId: wire.c,
      userId: wire.u,
      appOrigin: wire.o,
      expiresAt: wire.e,
    };
  } catch {
    return null;
  }
}
