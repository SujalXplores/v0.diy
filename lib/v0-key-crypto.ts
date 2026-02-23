import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("AUTH_SECRET is required for BYOK encryption");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptV0ApiKey(value: string): {
  encrypted: string;
  iv: string;
} {
  const iv = randomBytes(IV_LENGTH);
  const key = getEncryptionKey();

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptV0ApiKey(payload: {
  encrypted: string;
  iv: string;
}): string {
  const key = getEncryptionKey();
  const raw = Buffer.from(payload.encrypted, "base64");
  const iv = Buffer.from(payload.iv, "base64");

  const authTag = raw.subarray(raw.length - 16);
  const encrypted = raw.subarray(0, raw.length - 16);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
