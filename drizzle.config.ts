import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"], quiet: true });

const databaseUrl = process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL must be set to run drizzle-kit commands.");
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
