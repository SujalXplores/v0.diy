"use client";

import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useActionState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signInAction, signUpAction } from "../actions";
import { type AuthFormType, MIN_PASSWORD_LENGTH } from "../schemas";
import { PasswordInput } from "./password-input";

const FORM_COPY = {
  signin: {
    action: signInAction,
    submitLabel: "Sign in",
    pendingLabel: "Signing in...",
    passwordPlaceholder: "Enter your password",
    passwordHint: null,
    passwordAutoComplete: "current-password",
    minPasswordLength: 1,
    switchPrompt: "Don't have an account?",
    switchLabel: "Sign up",
    switchHref: "/register",
  },
  signup: {
    action: signUpAction,
    submitLabel: "Create account",
    pendingLabel: "Creating account...",
    passwordPlaceholder: "Create a password",
    passwordHint: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
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
    <form action={formAction} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            autoFocus
            autoComplete="email"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            placeholder={copy.passwordPlaceholder}
            required
            autoComplete={copy.passwordAutoComplete}
            minLength={copy.minPasswordLength}
          />
          {copy.passwordHint && (
            <FieldDescription>{copy.passwordHint}</FieldDescription>
          )}
        </Field>
      </FieldGroup>

      {state?.type === "error" && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending && <Spinner data-icon="inline-start" />}
        {isPending ? copy.pendingLabel : copy.submitLabel}
      </Button>

      <p className="text-center text-muted-foreground text-xs">
        {copy.switchPrompt}{" "}
        <Link
          href={copy.switchHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}
