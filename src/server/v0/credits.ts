import "server-only";

import { getUserV0ApiKey, getV0ClientForUser, unwrapV0 } from "./client";
import { requestV1 } from "./legacy-api";

export interface V0Credits {
  plan: string | null;
  balance: { remaining: number; total: number } | null;
  cycleEndsAt: string | null;
  usedThisWeek: number | null;
}

interface V1Plan {
  plan: string;
  billingCycle?: { start: number; end: number };
  balance?: { remaining: number; total: number };
}

const toIsoDate = (timestamp: number) =>
  new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString();

async function getPlan(userId: string): Promise<V1Plan | null> {
  const apiKey = await getUserV0ApiKey(userId);
  if (!apiKey) {
    return null;
  }
  try {
    return (await (await requestV1(apiKey, "/user/plan")).json()) as V1Plan;
  } catch (error) {
    console.warn("Couldn't load the v0 plan:", error);
    return null;
  }
}

async function getUsedThisWeek(userId: string): Promise<number | null> {
  try {
    const v0 = await getV0ClientForUser(userId);
    return unwrapV0(await v0.usage.getSummary({})).credits.total;
  } catch (error) {
    console.warn("Couldn't load v0 usage:", error);
    return null;
  }
}

export async function getV0Credits(userId: string): Promise<V0Credits> {
  const [plan, usedThisWeek] = await Promise.all([
    getPlan(userId),
    getUsedThisWeek(userId),
  ]);

  return {
    plan: plan?.plan ?? null,
    balance: plan?.balance ?? null,
    cycleEndsAt: plan?.billingCycle ? toIsoDate(plan.billingCycle.end) : null,
    usedThisWeek,
  };
}
