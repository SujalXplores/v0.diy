-- Migration: Remove guest users and anonymous chat tracking
-- This migration cleans up guest user data and drops the anonymous_chat_logs table

-- First, delete chat ownerships for guest users (users with null password and guest-* email pattern)
DELETE FROM "chat_ownerships"
WHERE "user_id" IN (
  SELECT "id" FROM "users"
  WHERE "email" LIKE 'guest-%@example.com' AND "password" IS NULL
);

-- Delete guest users
DELETE FROM "users"
WHERE "email" LIKE 'guest-%@example.com' AND "password" IS NULL;

-- Drop the anonymous_chat_logs table (no longer needed)
DROP TABLE IF EXISTS "anonymous_chat_logs";
