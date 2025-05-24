import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skip all checks if we're already on the config error page
  if (req.nextUrl.pathname.startsWith("/config-error")) {
    return res
  }

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Redirect to config error page
    return NextResponse.redirect(new URL("/config-error", req.url))
  }

  try {
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check if the user is authenticated
    const isAuthenticated = !!session

    // Define protected routes
    const isProtectedRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/recording") ||
      req.nextUrl.pathname.startsWith("/posts")

    // Define auth routes
    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/auth/signin") ||
      req.nextUrl.pathname.startsWith("/auth/signup") ||
      req.nextUrl.pathname === "/signin" ||
      req.nextUrl.pathname === "/signup"

    // Redirect unauthenticated users to the login page if they're trying to access a protected route
    if (isProtectedRoute && !isAuthenticated) {
      const redirectUrl = new URL("/auth/signin", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users to the dashboard if they're trying to access an auth route
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error with Supabase, redirect to config error page
    return NextResponse.redirect(new URL("/config-error", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/recording/:path*",
    "/posts/:path*",
    "/auth/signin",
    "/auth/signup",
    "/signin",
    "/signup",
    "/config-error",
  ],
}
