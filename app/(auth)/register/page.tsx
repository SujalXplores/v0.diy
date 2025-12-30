import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { auth } from "../auth";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-border border-b bg-card px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-semibold text-2xl text-foreground tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Get started with your free account
            </p>
          </div>

          <div className="bg-muted/30 px-6 py-8">
            <AuthForm type="signup" />
          </div>
        </div>
      </div>
    </div>
  );
}
