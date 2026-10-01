import { z } from "zod";
import {
  MAX_ATTACHMENT_URL_LENGTH,
  MAX_ATTACHMENTS,
  MAX_PROMPT_LENGTH,
  MAX_TOTAL_ATTACHMENT_URL_LENGTH,
  V0_MODEL_IDS,
} from "@/lib/v0-models";

export const chatIdSchema = z
  .string({ error: "Chat ID is required" })
  .regex(/^[A-Za-z0-9_-]{1,128}$/, "Invalid chat ID");

export const messageIdSchema = z
  .string({ error: "Message ID is required" })
  .regex(/^[A-Za-z0-9_-]{1,128}$/, "Invalid message ID");

export const chatPrivacySchema = z.enum(
  ["public", "private", "team", "team-edit", "unlisted"],
  { error: "Invalid privacy setting" },
);

export const modelConfigurationSchema = z.object({
  modelId: z.enum(V0_MODEL_IDS),
  imageGenerations: z.boolean(),
});

const attachmentSchema = z.object({
  url: z
    .string()
    .max(MAX_ATTACHMENT_URL_LENGTH, "Attachment is too large")
    .refine(
      (url) => url.startsWith("https://") || url.startsWith("data:"),
      "Attachments must be HTTPS or data URLs",
    ),
});

const promptFields = {
  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(MAX_PROMPT_LENGTH, "Message is too long"),
  attachments: z
    .array(attachmentSchema)
    .max(MAX_ATTACHMENTS, `Attach up to ${MAX_ATTACHMENTS} files`)
    .refine(
      (attachments) =>
        attachments.reduce((total, { url }) => total + url.length, 0) <=
        MAX_TOTAL_ATTACHMENT_URL_LENGTH,
      "Attachments are too large in total",
    )
    .optional(),
  modelConfiguration: modelConfigurationSchema.optional(),
};

export const createChatBodySchema = z.object(promptFields);

export const sendMessageBodySchema = z.object(promptFields);

export const updateChatBodySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Chat name is required")
      .max(200)
      .optional(),
    privacy: chatPrivacySchema.optional(),
  })
  .refine(
    (body) => body.title !== undefined || body.privacy !== undefined,
    "Nothing to update",
  );

export const duplicateChatBodySchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export const restoreMessageBodySchema = z.object({
  messageId: messageIdSchema,
});

export const resolveTaskBodySchema = z.object({
  task: z.looseObject({
    type: z.enum([
      "answered-questions",
      "plan-exit-response",
      "confirmed-steps",
      "confirmed-permissions",
      "vercel-connect-setup",
      "vercel-connect-authorization",
    ]),
  }),
  modelConfiguration: modelConfigurationSchema.partial().optional(),
});

export const updateFilesBodySchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string().min(1).max(500),
        content: z.string().max(2_000_000).nullable(),
        encoding: z.enum(["utf8", "base64"]).optional(),
      }),
    )
    .min(1, "No files to update")
    .max(100, "Update at most 100 files at once"),
});

export const importRepoBodySchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid repository URL")
    .refine((url) => url.startsWith("https://"), "Use an HTTPS URL"),
  branch: z.string().trim().max(200).optional(),
});

export const importZipBodySchema = z.object({
  url: z
    .string()
    .max(MAX_TOTAL_ATTACHMENT_URL_LENGTH, "ZIP is too large")
    .refine(
      (url) => url.startsWith("data:") || url.startsWith("https://"),
      "Upload a ZIP file",
    ),
  title: z.string().trim().max(200).optional(),
});

export const importFilesBodySchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(500),
        content: z.string().max(2_000_000),
        encoding: z.enum(["utf8", "base64"]).optional(),
      }),
    )
    .min(1, "Choose at least one file")
    .max(500, "Import at most 500 files"),
});
