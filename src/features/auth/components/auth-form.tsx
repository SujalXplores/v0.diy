"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction, signUpAction } from "../actions";
import { type AuthFormType, MIN_PASSWORD_LENGTH } from "../schemas";
import { PasswordInput } from "./password-input";

const FORM_COPY = {
  signin: {
    action: signInAction,
    submitLabel: "Sign In",
    pendingLabel: "Signing in...",
    passwordPlaceholder: "••••••••",
    passwordAutoComplete: "current-password",
    minPasswordLength: 1,
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchHref: "/register",
  },
  signup: {
    action: signUpAction,
    submitLabel: "Create Account",
    pendingLabel: "Creating account...",
    passwordPlaceholder: `Min. ${MIN_PASSWORD_LENGTH} characters`,
    passwordAutoComplete: "new-password",
    minPasswordLength: MIN_PASSWORD_LENGTH,
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/login",
  },
} as const;

interface AuthFormProps {
  type: AuthFormType;
}

export function AuthForm({ type }: AuthFormProps) {
  const copy = FORM_COPY[type];
  const [state, formAction, isPending] = useActionState(copy.action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block font-medium text-foreground text-sm"
        >
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          autoFocus
          autoComplete="email"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block font-medium text-foreground text-sm"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder={copy.passwordPlaceholder}
          required
          autoComplete={copy.passwordAutoComplete}
          minLength={copy.minPasswordLength}
        />
      </div>

      {state?.type === "error" && (
        <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-destructive text-sm">
          {state.message}
        </div>
      )}

      <Button
        type="submit"
        className="h-10 w-full"
        disabled={isPending}
        size="lg"
      >
        {isPending ? copy.pendingLabel : copy.submitLabel}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        {copy.switchPrompt}{" "}
        <Link
          href={copy.switchHref}
          className="font-medium text-foreground transition-colors hover:text-primary"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}
