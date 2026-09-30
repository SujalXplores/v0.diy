import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { auth } from "@/server/auth/auth";

export default async function RegisterPage() {
  if (await auth()) {
    redirect("/");
  }

  return (
    <AuthCard
      title="Create an account"
      description="Get started with your free account"
    >
      <AuthForm type="signup" />
    </AuthCard>
  );
}
