"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiKeyErrorCode } from "@/lib/api-error-codes";
import { ApiRequestError } from "@/lib/http-client";
import { CREDITS_URL, fetchCredits, type V0Credits } from "../lib/credits-api";

const creditFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function Balance({ credits }: { credits: V0Credits }) {
  const { balance, cycleEndsAt, usedThisWeek } = credits;
  const percent = balance?.total
    ? Math.min(100, Math.max(0, (balance.remaining / balance.total) * 100))
    : 0;
  const details = [
    cycleEndsAt && `Resets ${dateFormat.format(new Date(cycleEndsAt))}`,
    usedThisWeek !== null &&
      `${creditFormat.format(usedThisWeek)} used in the last 7 days`,
  ].filter(Boolean);

  return (
    <>
      {balance ? (
        <>
          <p className="text-muted-foreground text-xs">
            <span className="font-medium text-foreground text-sm tabular-nums">
              {creditFormat.format(balance.remaining)}
            </span>{" "}
            of {creditFormat.format(balance.total)} left
          </p>
          <div
            role="progressbar"
            aria-label="Credits left"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-xs">
          v0 didn't share your balance.
        </p>
      )}
      {details.length > 0 && (
        <p className="text-[0.6875rem] text-muted-foreground">
          {details.join(" · ")}
        </p>
      )}
    </>
  );
}

function describeError(error: unknown): string {
  return error instanceof ApiRequestError && isApiKeyErrorCode(error.code)
    ? "Add your v0 API key to see credits."
    : "Couldn't load your credits.";
}

export function CreditsSummary() {
  const { data, error, isLoading } = useSWR(CREDITS_URL, fetchCredits, {
    revalidateOnFocus: false,
  });

  return (
    <section aria-label="v0 credits" className="grid gap-1.5 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-xs">Credits</span>
        {data?.plan && (
          <Badge variant="secondary" className="capitalize">
            {data.plan}
          </Badge>
        )}
      </div>
      {data ? (
        <Balance credits={data} />
      ) : isLoading ? (
        <div aria-busy="true" className="grid gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-1.5 w-full" />
        </div>
      ) : (
        error && (
          <p className="text-muted-foreground text-xs">
            {describeError(error)}
          </p>
        )
      )}
    </section>
  );
}
