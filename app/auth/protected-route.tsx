"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Supabase client once
  const supabase = createClientComponentClient<Database>()

  // Check if the current route is public
  const isPublicRoute = useCallback(() => {
    const publicRoutes = ["/", "/onboarding", "/auth/signin", "/auth/signup", "/signin", "/signup", "/auth/callback"]
    return publicRoutes.includes(pathname) || pathname.startsWith("/auth/")
  }, [pathname])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth session error:", error)
          if (!isPublicRoute()) {
            router.push("/signin")
          }
          return
        }

        if (!session && !isPublicRoute()) {
          // If no session and not a public route, redirect to sign in
          router.push("/signin")
        } else if (
          session &&
          (pathname === "/signin" ||
            pathname === "/signup" ||
            pathname === "/onboarding" ||
            pathname === "/auth/signin" ||
            pathname === "/auth/signup")
        ) {
          // If authenticated and on auth routes, redirect to dashboard
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        if (!isPublicRoute()) {
          router.push("/signin")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        event === "SIGNED_IN" &&
        (pathname === "/signin" ||
          pathname === "/signup" ||
          pathname === "/onboarding" ||
          pathname === "/auth/signin" ||
          pathname === "/auth/signup")
      ) {
        router.push("/dashboard")
      } else if (event === "SIGNED_OUT" && !isPublicRoute()) {
        router.push("/signin")
      }
    })

    // Clean up the subscription
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [pathname, router, supabase, isPublicRoute])

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 size={40} className="text-white animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
