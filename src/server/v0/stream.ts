import "server-only";

import type { V0StreamResult, V0StreamUpdate } from "v0";
import { HttpError } from "@/server/http/errors";
import { toV0HttpError } from "./client";

export interface V0StreamRequestOptions {
  sseMaxRetryAttempts: number;
  onSseError: (error: unknown) => void;
  signal?: AbortSignal;
}

export interface OpenedV0Stream {
  result: V0StreamResult;
  first: V0StreamUpdate;
}

interface OpenV0StreamOptions {
  signal?: AbortSignal;
  until?: (update: V0StreamUpdate) => boolean;
}

const SSE_STATUS_PATTERN = /SSE failed: (\d{3})/;

function readStatus(error: unknown): number | undefined {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const status = SSE_STATUS_PATTERN.exec(message)?.[1];
  return status ? Number(status) : undefined;
}

function toStreamError(streamError: unknown, sseError: unknown): HttpError {
  if (streamError instanceof HttpError) {
    return streamError;
  }

  const status = readStatus(sseError) ?? readStatus(streamError);
  if (status !== undefined) {
    return toV0HttpError(status, undefined);
  }

  const message =
    streamError instanceof Error ? streamError.message : "v0 stream failed";
  return new HttpError(502, message);
}

export async function openV0Stream(
  start: (options: V0StreamRequestOptions) => Promise<V0StreamResult>,
  { signal, until = () => true }: OpenV0StreamOptions = {},
): Promise<OpenedV0Stream> {
  let sseError: unknown;
  const options: V0StreamRequestOptions = {
    sseMaxRetryAttempts: 1,
    onSseError: (error) => {
      sseError = error;
    },
    ...(signal && { signal }),
  };

  const result = await start(options);
  const iterator = result.stream[Symbol.asyncIterator]();

  try {
    while (true) {
      const next = await iterator.next();
      if (next.done) {
        throw toStreamError(undefined, sseError);
      }
      if (until(next.value)) {
        return { result, first: next.value };
      }
    }
  } catch (error) {
    throw toStreamError(error, sseError);
  } finally {
    await iterator.return?.();
  }
}

export function getStreamChatId(update: V0StreamUpdate): string | undefined {
  return update.chat?.id ?? update.message?.chatId;
}
