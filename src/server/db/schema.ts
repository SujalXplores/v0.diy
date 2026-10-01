import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  v0_api_key_encrypted: varchar("v0_api_key_encrypted", { length: 512 }),
  v0_api_key_iv: varchar("v0_api_key_iv", { length: 64 }),
  v0_api_key_updated_at: timestamp("v0_api_key_updated_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof users>;

export type ChatApiVersion = "v1" | "v2";

export const chat_ownerships = pgTable(
  "chat_ownerships",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    v0_chat_id: varchar("v0_chat_id", { length: 255 }).notNull(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    created_at: timestamp("created_at").notNull().defaultNow(),
    api_version: varchar("api_version", { length: 8 })
      .$type<ChatApiVersion>()
      .notNull()
      .default("v1"),
  },
  (table) => [unique().on(table.v0_chat_id)],
);

export type ChatOwnership = InferSelectModel<typeof chat_ownerships>;
