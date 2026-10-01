import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb } from "../connection";
import { type User, users } from "../schema";

export type AuthUser = Pick<User, "id" | "email" | "password" | "created_at">;

export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const [user] = await getDb()
    .select({
      id: users.id,
      email: users.email,
      password: users.password,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.email, email));

  return user ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<void> {
  await getDb().execute(sql`
    insert into "users" ("email", "password")
    values (${email}, ${passwordHash})
  `);
}
