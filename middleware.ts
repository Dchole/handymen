import { NextRequest, NextResponse } from "next/server";
import { AccountType } from "./app/types";

const publicRoutes = [
  "/handyman/login",
  "/handyman/register",
  "/customer/login",
  "/customer/register"
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!path.startsWith("/handyman") && !path.startsWith("/customer")) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);
  const isHandymanRoute = path.startsWith("/handyman");
  const isCustomerRoute = path.startsWith("/customer");

  const session = request.cookies.get("session");
  const accountType = session?.value
    ? (JSON.parse(session.value).accountType as AccountType)
    : null;

  const appSide = path.split("/").filter(Boolean)[0].toUpperCase();

  if (accountType && accountType !== appSide) {
    const redirectUrl = accountType ? `/${accountType.toLowerCase()}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!isPublicRoute && !session) {
    if (isHandymanRoute) {
      const loginUrl = new URL("/handyman/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
    if (isCustomerRoute) {
      const loginUrl = new URL("/customer/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isPublicRoute && session) {
    const { searchParams } = request.nextUrl;
    const redirectUrl = searchParams.get("redirect");
    const fallbackUrl = isHandymanRoute ? "/handyman" : "/customer";

    return NextResponse.redirect(
      new URL(redirectUrl || fallbackUrl, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"]
};
