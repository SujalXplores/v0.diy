ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "v0_api_key_encrypted" varchar(512),
ADD COLUMN IF NOT EXISTS "v0_api_key_iv" varchar(64),
ADD COLUMN IF NOT EXISTS "v0_api_key_updated_at" timestamp;
