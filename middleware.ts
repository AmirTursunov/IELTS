import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // ✅ Admin page protection
    if (path.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Admin pages - faqat admin
        if (path.startsWith("/admin")) {
          return !!token && token.role === "admin";
        }

        // Protected user pages - login kerak
        return !!token;
      },
    },
  },
);

// Protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tests/:path*",
    "/profile/:path*",
    "/reading/test/:path*",
    "/listening/test/:path*",
    "/writing/test/:path*",
    "/speaking/test/:path*",
    "/admin/:path*", // ✅ Admin pages
  ],
};
