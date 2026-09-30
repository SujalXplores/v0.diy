import "server-only";

import { compare, hash } from "bcrypt-ts";

const SALT_ROUNDS = 10;

// A valid bcrypt hash compared against when a user doesn't exist, so failed
// logins take the same time whether or not the email is registered.
const DUMMY_PASSWORD_HASH =
  "$2b$10$k7L3lUJhDLKBGbz4Yf8ZJe9Yk6j5Qz1Xr2Wv8Ts7Nq9Mp3Lk4Jh6Fg";

export function hashPassword(plainTextPassword: string): Promise<string> {
  return hash(plainTextPassword, SALT_ROUNDS);
}

/** Verifies a password, spending constant time when no hash is stored. */
export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string | null | undefined,
): Promise<boolean> {
  if (!passwordHash) {
    await compare(plainTextPassword, DUMMY_PASSWORD_HASH);
    return false;
  }

  return compare(plainTextPassword, passwordHash);
}
