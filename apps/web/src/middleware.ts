import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loginRedirect } from "@/lib/route-guard";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  const secret = process.env.AUTH_SECRET ?? "";
  const hasSession = await verifySessionToken(raw, secret);
  const target = loginRedirect(request.nextUrl.pathname, hasSession);
  if (target) {
    return NextResponse.redirect(new URL(target, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/hoje/:path*", "/hoje", "/login"],
};
