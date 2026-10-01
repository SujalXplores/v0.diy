const UNITS = [
  { unit: "year", seconds: 360 * 24 * 60 * 60 },
  { unit: "month", seconds: 30 * 24 * 60 * 60 },
  { unit: "day", seconds: 24 * 60 * 60 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
] as const;

export function formatRelativeTime(
  date: string | Date,
  now: Date = new Date(),
): string {
  const elapsedSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000,
  );

  for (const { unit, seconds } of UNITS) {
    const value = Math.floor(elapsedSeconds / seconds);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
}
