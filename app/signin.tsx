"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        window.location.href = "/dashboard"
      }
    }

    checkUser()
  }, [supabase])

  // Handle form submission for email/password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to dashboard on successful login
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      console.error("Sign in error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)

      // Sign in with Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) throw error

      // The redirect is handled by the OAuth provider
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
      console.error("Google sign in error:", err)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/onboarding" className="flex items-center text-white">
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-base">Back</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-white text-center mb-10">Welcome Back</h1>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-[#2C1215] border border-[#5C2327] rounded-lg">
          <p className="text-[#F87171] text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form className="w-full" onSubmit={handleSignIn}>
        <div className="mb-6">
          <label className="block text-sm text-[#888888] mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 bg-transparent text-white border-b border-[#333333] focus:outline-none focus:border-white focus:ring-0 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm text-[#888888] mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-transparent text-white border-b border-[#333333] focus:outline-none focus:border-white focus:ring-0 focus:shadow-[0_0_0_1px_rgba(255,255,255,0.1)] pr-10"
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3 text-[#888888]"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end mb-8">
          <Link href="/forgot-password" className="text-sm text-[#888888]">
            Forgot password?
          </Link>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          className="w-full h-12 bg-[#1C1C1E] text-white rounded-xl font-semibold mb-8 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-8">
        <div className="flex-1 h-px bg-[#333333]"></div>
        <span className="px-4 text-[#888888]">OR</span>
        <div className="flex-1 h-px bg-[#333333]"></div>
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 bg-transparent border border-[#333333] text-white rounded-xl font-semibold flex items-center justify-center mb-8"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Sign Up link */}
      <div className="text-center mt-auto py-6">
        <span className="text-[#888888]">New to AudioBrand? </span>
        <Link href="/signup" className="text-white">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
