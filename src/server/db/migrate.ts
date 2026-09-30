import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: [".env.local", ".env"], quiet: true });

const MIGRATIONS_FOLDER = "src/server/db/migrations";

async function runMigrations(): Promise<void> {
  const url = process.env.POSTGRES_URL;

  if (!url) {
    console.log(
      "POSTGRES_URL is not defined in .env.local or .env, skipping migrations",
    );
    return;
  }

  const connection = postgres(url, { max: 1 });

  try {
    console.log("⏳ Running migrations...");
    const start = Date.now();

    await migrate(drizzle(connection), { migrationsFolder: MIGRATIONS_FOLDER });

    console.log("✅ Migrations completed in", Date.now() - start, "ms");
  } finally {
    await connection.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error("❌ Migration failed");
  console.error(error);
  process.exit(1);
});
