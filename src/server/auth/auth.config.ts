import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe part of the auth configuration. Providers are added in auth.ts
 * because credential checks need bcrypt, which only runs on Node.js.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [],
  callbacks: {},
} satisfies NextAuthConfig;
