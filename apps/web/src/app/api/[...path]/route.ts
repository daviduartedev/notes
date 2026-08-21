import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function resolveApiOrigin(): string {
  return (
    process.env.API_ORIGIN ??
    process.env.NEXT_PUBLIC_API_ORIGIN ??
    "http://localhost:3014"
  );
}

async function proxy(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const targetPath = pathSegments.join("/");
  const url = `${resolveApiOrigin()}/api/${targetPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(url, init);
  const body = await response.arrayBuffer();

  const responseHeaders = new Headers();
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  if (setCookies.length > 0) {
    for (const value of setCookies) {
      responseHeaders.append("set-cookie", value);
    }
  } else {
    const single = response.headers.get("set-cookie");
    if (single) {
      responseHeaders.append("set-cookie", single);
    }
  }

  const responseContentType = response.headers.get("content-type");
  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  return new NextResponse(body, {
    status: response.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxy(request, path);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
