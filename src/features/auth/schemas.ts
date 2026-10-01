import { z } from "zod";

const emailSchema = z.email("Please enter a valid email.");

export const MIN_PASSWORD_LENGTH = 6;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    ),
});

export type AuthFormType = "signin" | "signup";

export interface AuthActionResult {
  type: "error" | "success";
  message: string;
}
