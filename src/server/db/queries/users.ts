import "server-only";

import { eq, sql } from "drizzle-orm";
import { getDb } from "../connection";
import { type User, users } from "../schema";

export type AuthUser = Pick<User, "id" | "email" | "password" | "created_at">;

/** Retrieves the credentials of a user by email address. */
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

/** Creates a new user with an already hashed password. */
export async function createUser(
  email: string,
  passwordHash: string,
): Promise<void> {
  // Raw SQL keeps the insert limited to these columns, so registration keeps
  // working on databases that haven't run the BYOK migration yet.
  await getDb().execute(sql`
    insert into "users" ("email", "password")
    values (${email}, ${passwordHash})
  `);
}
