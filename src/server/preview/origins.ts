export const PREVIEW_PATH_PREFIX = "/preview";

const DEV_PREVIEW_HOSTNAME = "127.0.0.1";

function parseOrigin(value: string | undefined): URL | null {
  if (!value) {
    return null;
  }
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function hasConfiguredPreviewOrigin(): boolean {
  return parseOrigin(process.env.PREVIEW_ORIGIN) !== null;
}

export function getPreviewOrigin(appOrigin: string): string | null {
  const app = new URL(appOrigin);
  const configured = parseOrigin(process.env.PREVIEW_ORIGIN);

  if (configured) {
    return isSameSite(configured.hostname, app.hostname)
      ? null
      : configured.origin;
  }

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  if (app.hostname === DEV_PREVIEW_HOSTNAME) {
    return null;
  }
  const preview = new URL(appOrigin);
  preview.hostname = DEV_PREVIEW_HOSTNAME;
  return preview.origin;
}

export function isPreviewHost(host: string | null): boolean {
  if (!host) {
    return false;
  }
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  const configured = parseOrigin(process.env.PREVIEW_ORIGIN);

  if (configured) {
    return hostname === configured.hostname.toLowerCase();
  }
  return (
    process.env.NODE_ENV === "development" && hostname === DEV_PREVIEW_HOSTNAME
  );
}

function isSameSite(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x === y || x.endsWith(`.${y}`) || y.endsWith(`.${x}`);
}
