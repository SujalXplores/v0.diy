"use client";

import type { ReactNode } from "react";
import { SWRConfig, type SWRConfiguration } from "swr";
import { ApiRequestError, requestJson } from "@/lib/http-client";

const MAX_ERROR_RETRIES = 3;
const ERROR_RETRY_INTERVAL_MS = 5000;

const SWR_OPTIONS: SWRConfiguration = {
  fetcher: (url: string) =>
    requestJson(url, {}, "An error occurred while fetching the data."),
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
    // Client errors (401, 404, 428…) won't fix themselves on retry.
    const isClientError =
      error instanceof ApiRequestError && error.status < 500;

    if (isClientError || retryCount >= MAX_ERROR_RETRIES) {
      return;
    }

    setTimeout(() => revalidate({ retryCount }), ERROR_RETRY_INTERVAL_MS);
  },
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={SWR_OPTIONS}>{children}</SWRConfig>;
}
