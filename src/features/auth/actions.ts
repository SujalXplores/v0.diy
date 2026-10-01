"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import type { z } from "zod";
import { signIn } from "@/server/auth/auth";
import { hashPassword } from "@/server/auth/password";
import { createUser, getUserByEmail } from "@/server/db/queries/users";
import { type AuthActionResult, signInSchema, signUpSchema } from "./schemas";

const GENERIC_ERROR = "Something went wrong. Please try again.";

const POST_AUTH_REDIRECT = "/?refresh=session";

function errorResult(message: string): AuthActionResult {
  return { type: "error", message };
}

function parseCredentials<Schema extends z.ZodType>(
  schema: Schema,
  formData: FormData,
) {
  return schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function signInWithCredentials(credentials: {
  email: string;
  password: string;
}) {
  return signIn("credentials", { ...credentials, redirect: false });
}

function completeAuthentication(): never {
  revalidatePath("/");
  redirect(POST_AUTH_REDIRECT);
}

export async function signInAction(
  _previousState: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = parseCredentials(signInSchema, formData);

  if (!parsed.success) {
    return errorResult(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }

  try {
    await signInWithCredentials(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResult(
        error.type === "CredentialsSignin"
          ? "Invalid credentials. Please try again."
          : GENERIC_ERROR,
      );
    }
    throw error;
  }

  completeAuthentication();
}

export async function signUpAction(
  _previousState: AuthActionResult | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = parseCredentials(signUpSchema, formData);

  if (!parsed.success) {
    return errorResult(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
  }

  const { email, password } = parsed.data;

  if (await getUserByEmail(email)) {
    return errorResult("User already exists. Please sign in instead.");
  }

  await createUser(email, await hashPassword(password));

  try {
    await signInWithCredentials({ email, password });
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResult(
        "Failed to sign in after registration. Please try signing in manually.",
      );
    }
    throw error;
  }

  completeAuthentication();
}
