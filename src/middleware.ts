import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Проверяем роль для админ-маршрутов
        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            req.nextauth.token?.role !== "ADMIN"
        ) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/editor/:path*",
        "/admin/:path*",
        "/api/projects/:path*",
        "/api/generate/:path*",
        "/api/upload/:path*",
        "/api/render/:path*",
    ],
};
