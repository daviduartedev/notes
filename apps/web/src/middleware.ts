import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loginRedirect } from "@/lib/route-guard";

const SESSION_COOKIE = "authjs.session-token";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const target = loginRedirect(request.nextUrl.pathname, hasSession);
  if (target) {
    return NextResponse.redirect(new URL(target, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/hoje/:path*", "/hoje", "/login"],
};
