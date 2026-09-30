// Months are treated as 30 days and years as 12 such months.
const UNITS = [
  { unit: "year", seconds: 360 * 24 * 60 * 60 },
  { unit: "month", seconds: 30 * 24 * 60 * 60 },
  { unit: "day", seconds: 24 * 60 * 60 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
] as const;

/** Formats a date as "just now", "5 minutes ago", "2 days ago", etc. */
export function formatRelativeTime(
  dateString: string,
  now: Date = new Date(),
): string {
  const elapsedSeconds = Math.floor(
    (now.getTime() - new Date(dateString).getTime()) / 1000,
  );

  for (const { unit, seconds } of UNITS) {
    const value = Math.floor(elapsedSeconds / seconds);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
