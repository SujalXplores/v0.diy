"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, signUpAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    type === "signin" ? signInAction : signUpAction,
    undefined,
  );
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={type === "signup" ? "Min. 6 characters" : "••••••••"}
            required
            autoComplete={
              type === "signin" ? "current-password" : "new-password"
            }
            className="h-10 pr-10"
            minLength={type === "signup" ? 6 : 1}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
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
        {isPending
          ? type === "signin"
            ? "Signing in..."
            : "Creating account..."
          : type === "signin"
            ? "Sign In"
            : "Create Account"}
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        {type === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
