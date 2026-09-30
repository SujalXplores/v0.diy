import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getUserByEmail } from "@/server/db/queries/users";
import { isDevelopment } from "@/server/env";
import { authConfig } from "./auth.config";
import { verifyPassword } from "./password";

if (!process.env.AUTH_SECRET && isDevelopment) {
  console.warn(
    "⚠️  AUTH_SECRET not found. Using default secret for development.\n" +
      "For production, please set AUTH_SECRET in your environment variables.\n",
  );
  process.env.AUTH_SECRET = "dev-secret-key-not-for-production";
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const credentialsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await getUserByEmail(email);
        const passwordsMatch = await verifyPassword(password, user?.password);

        return user && passwordsMatch ? user : null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
