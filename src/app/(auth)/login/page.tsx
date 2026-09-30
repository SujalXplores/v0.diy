import { MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthForm } from "@/features/auth/components/auth-form";
import { auth } from "@/server/auth/auth";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await auth()) {
    redirect("/");
  }

  const { callbackUrl } = await searchParams;
  const isRedirectedFromChat = callbackUrl === "/";

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
      notice={
        isRedirectedFromChat && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-primary">
            <MessageSquare className="h-5 w-5 shrink-0" />
            <p className="font-medium text-sm">Sign in to start chatting</p>
          </div>
        )
      }
    >
      <AuthForm type="signin" />
    </AuthCard>
  );
}
