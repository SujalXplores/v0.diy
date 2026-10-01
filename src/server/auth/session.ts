import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

export const requireSessionUserId = cache(async (): Promise<string> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return userId;
});
