import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Database = ReturnType<typeof createDatabase>;

function createDatabase(url: string) {
  return drizzle(postgres(url), { schema });
}

const globalForDb = globalThis as typeof globalThis & {
  database?: Database;
};

function initDatabase(): Database | null {
  const url = process.env.POSTGRES_URL;

  if (!url) {
    return null;
  }

  globalForDb.database ??= createDatabase(url);
  return globalForDb.database;
}

const database = initDatabase();

export function getDb(): Database {
  if (!database) {
    throw new Error("Database not initialized. Ensure POSTGRES_URL is set.");
  }

  return database;
}
