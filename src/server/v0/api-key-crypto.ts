import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

export interface EncryptedValue {
  encrypted: string;
  iv: string;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.trim().length === 0) {
    throw new Error("AUTH_SECRET is required for BYOK encryption");
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptV0ApiKey(value: string): EncryptedValue {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  return {
    encrypted: Buffer.concat([encrypted, cipher.getAuthTag()]).toString(
      "base64",
    ),
    iv: iv.toString("base64"),
  };
}

export function decryptV0ApiKey({ encrypted, iv }: EncryptedValue): string {
  const raw = Buffer.from(encrypted, "base64");
  const authTag = raw.subarray(raw.length - AUTH_TAG_LENGTH);
  const ciphertext = raw.subarray(0, raw.length - AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
