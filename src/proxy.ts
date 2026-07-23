import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthEnabled, isValidSessionToken, SESSION_COOKIE } from "@/lib/session";

export function proxy(request: NextRequest) {
  if (!isAuthEnabled()) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/login")) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
