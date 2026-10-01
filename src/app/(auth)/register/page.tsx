import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="Start building with your own v0 API key"
    >
      <AuthForm type="signup" />
    </AuthCard>
  );
}
