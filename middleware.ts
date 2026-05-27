import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/upload", "/insights"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get("ops_session")?.value;
  if (session === "1") return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/upload/:path*", "/insights/:path*"],
};
