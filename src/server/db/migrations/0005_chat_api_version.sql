-- Existing chats were created with the v1 API, which v2 can't open. They keep
-- 'v1' and are offered a migration; new chats are recorded as 'v2'.
ALTER TABLE "chat_ownerships" ADD COLUMN IF NOT EXISTS "api_version" varchar(8) DEFAULT 'v1' NOT NULL;
