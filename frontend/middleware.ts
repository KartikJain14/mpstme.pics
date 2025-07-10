import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // First try to get token from cookies (which is most reliable for server components)
    const cookieToken = request.cookies.get("auth_token")?.value;
    console.log(cookieToken);

    // Then try authorization header as fallback
    const authHeader = request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Use either token source
    const token = cookieToken || headerToken;

    // Verify the token and get user
    console.log("Token found:", token ? "yes" : "no");
    const user = token ? verifyToken(token) : null;
    console.log("User verified:", user ? "yes" : "no", user?.email);

    // Redirect to login if no user is found
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    // Handle specific paths based on user role
    if (
      pathname.startsWith("/dashboard/superadmin") &&
      user.role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      pathname.startsWith("/dashboard/clubadmin") &&
      user.role !== "clubadmin" &&
      user.role !== "superadmin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Allow access for all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
