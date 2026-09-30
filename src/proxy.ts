import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = new Set(["/login", "/register"]);

/** Routes reachable without a session: the homepage, auth pages and APIs. */
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" || AUTH_PAGES.has(pathname) || pathname.startsWith("/api/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Health check endpoint.
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    console.error(
      "❌ Missing AUTH_SECRET environment variable. Please check your .env file.",
    );
    // Let the app render its own setup screen.
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
