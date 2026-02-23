// Load environment variables
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({
  path: [".env.local", ".env"],
});

let db: ReturnType<typeof drizzle> | null = null;

// Only initialize database if POSTGRES_URL is available
if (process.env.POSTGRES_URL) {
  console.log("🗄️  Using PostgreSQL database");
  const client = postgres(process.env.POSTGRES_URL);
  db = drizzle(client, { schema });
}

export default db;
