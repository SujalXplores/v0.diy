import { requestJson } from "@/lib/http-client";

export interface V0Credits {
  plan: string | null;
  balance: { remaining: number; total: number } | null;
  cycleEndsAt: string | null;
  usedThisWeek: number | null;
}

export const CREDITS_URL = "/api/user/credits";

export const fetchCredits = () =>
  requestJson<V0Credits>(CREDITS_URL, {}, "Failed to load credits");
