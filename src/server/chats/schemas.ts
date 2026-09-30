import { z } from "zod";

export const chatIdSchema = z
  .string({ error: "Chat ID is required" })
  .min(1, "Chat ID is required");

export const chatPrivacySchema = z.enum(
  ["public", "private", "team", "team-edit", "unlisted"],
  { error: "Invalid privacy setting" },
);

export const chatIdBodySchema = z.object({ chatId: chatIdSchema });

export const sendMessageBodySchema = z.object({
  message: z
    .string({ error: "Message is required" })
    .min(1, "Message is required"),
  chatId: z.string().min(1).optional(),
  streaming: z.boolean().optional(),
  attachments: z.array(z.object({ url: z.string() })).optional(),
});

export const updateChatBodySchema = z.object({
  name: z
    .string({ error: "Chat name is required" })
    .trim()
    .min(1, "Chat name is required"),
});

export const updateVisibilityBodySchema = z.object({
  privacy: chatPrivacySchema,
});
