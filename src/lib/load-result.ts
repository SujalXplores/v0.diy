export type LoadResult<T> =
  | { status: "ok"; data: T }
  | { status: "missing-key" }
  | { status: "error"; message: string };
