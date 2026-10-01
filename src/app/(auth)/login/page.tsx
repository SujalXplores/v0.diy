import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { LoginNotice } from "@/features/auth/components/login-notice";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
      notice={
        <Suspense fallback={null}>
          <LoginNotice />
        </Suspense>
      }
    >
      <AuthForm type="signin" />
    </AuthCard>
  );
}
