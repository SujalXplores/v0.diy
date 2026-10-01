import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  hasConfiguredPreviewOrigin,
  isPreviewHost,
  PREVIEW_PATH_PREFIX,
} from "@/server/preview/origins";

const AUTH_PAGES = new Set(["/login", "/register"]);
const PREVIEW_PATH = /^\/preview\/([^/]+)(?:\/|$)/;

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" || AUTH_PAGES.has(pathname) || pathname.startsWith("/api/")
  );
}

const notFound = () => new NextResponse("Not found", { status: 404 });

function redirectPreviewSubresource(request: NextRequest): NextResponse | null {
  const referer = request.headers.get("referer");
  if (!(referer && URL.canParse(referer))) {
    return null;
  }

  const refererUrl = new URL(referer);
  if (refererUrl.host !== request.headers.get("host")) {
    return null;
  }

  const token = refererUrl.pathname.match(PREVIEW_PATH)?.[1];
  if (!token) {
    return null;
  }

  const { pathname, search, protocol } = request.nextUrl;
  const target = new URL(
    `${PREVIEW_PATH_PREFIX}/${token}${pathname}${search}`,
    `${request.headers.get("x-forwarded-proto") ?? protocol.replace(":", "")}://${refererUrl.host}`,
  );
  return NextResponse.redirect(target, 307);
}

function handlePreviewHost(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(`${PREVIEW_PATH_PREFIX}/`)) {
    return NextResponse.next();
  }

  const redirect = redirectPreviewSubresource(request);
  if (redirect) {
    return redirect;
  }

  return hasConfiguredPreviewOrigin() ? notFound() : NextResponse.next();
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (isPreviewHost(request.headers.get("host"))) {
    const response = handlePreviewHost(request);
    if (
      pathname.startsWith(`${PREVIEW_PATH_PREFIX}/`) ||
      response.status !== 200
    ) {
      return response;
    }
  } else if (pathname.startsWith(`${PREVIEW_PATH_PREFIX}/`)) {
    return notFound();
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    console.error(
      "❌ Missing AUTH_SECRET environment variable. Please check your .env file.",
    );
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret,
    secureCookie: process.env.NODE_ENV !== "development",
  });

  if (!token) {
    return isPublicPath(pathname)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    {
      source: "/_next/:path*",
      has: [{ type: "header", key: "referer", value: ".*/preview/.*" }],
    },
    {
      source: "/(favicon.ico|sitemap.xml|robots.txt)",
      has: [{ type: "header", key: "referer", value: ".*/preview/.*" }],
    },
  ],
};
