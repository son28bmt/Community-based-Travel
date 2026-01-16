import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/", req.url));
            }
            return null;
        }

        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            req.nextauth.token?.role !== "admin"
        ) {
            return NextResponse.rewrite(new URL("/login?error=denied", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")) {
                    return true;
                }
                return !!token;
            },
        },
    }
);

export const config = { matcher: ["/admin/:path*", "/user/:path*", "/login", "/register"] };
