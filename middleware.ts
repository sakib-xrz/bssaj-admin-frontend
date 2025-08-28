import { jwtDecode, JwtPayload } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN_KEY } from "./lib/constant";

interface CustomJwtPayload extends JwtPayload {
  role?: "SUPER_ADMIN" | "ADMIN";
}

const AuthRoutes = ["/login"];
const commonPrivateRoutes = ["/change-password", "/profile"];

const roleBasedRoutes = {
  SUPER_ADMIN: [
    "/users",
    "/members",
    "/agencies",
    "/events",
    "/blogs",
    "/news",
    "/certifications",
    "/settings",
  ],
  ADMIN: [
    "/users",
    "/members",
    "/agencies",
    "/events",
    "/blogs",
    "/news",
    "/certifications",
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  // Handle root path
  if (pathname === "/") {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/users", request.url));
  }

  // Allow public routes and auth routes when no token
  if (!accessToken) {
    if (AuthRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(`/login?next=${pathname}`, request.url)
    );
  }

  let decodedData: CustomJwtPayload | null = null;
  try {
    decodedData = jwtDecode<CustomJwtPayload>(accessToken);
  } catch {
    // If token is invalid, redirect to home
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = decodedData?.role;

  // Redirect authenticated users away from login pages
  if (AuthRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/users", request.url));
  }

  // Allow common private routes for all authenticated users
  if (commonPrivateRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check role-based access
  if (role && roleBasedRoutes[role]) {
    const allowedRoutes = roleBasedRoutes[role];

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (hasAccess) {
      return NextResponse.next();
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/",
    "/users",
    "/members",
    "/agencies",
    "/events",
    "/blogs",
    "/news",
    "/certifications",
    "/change-password",
    "/profile",
  ],
};
