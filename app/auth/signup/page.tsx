import type { Metadata } from "next"
import Link from "next/link"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
  title: "Sign Up | AudioBrand",
  description: "Create a new AudioBrand account",
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex">
      {/* Left Side - Feature Highlight */}
      <div className="hidden lg:flex lg:flex-1 bg-black text-white items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-3xl font-bold mb-4">Start your content journey today</h3>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Join thousands of founders who are building their personal brand effortlessly.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mb-12">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">7 days free trial</h4>
                <p className="text-sm text-gray-400">No credit card required. Cancel anytime.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI-powered content</h4>
                <p className="text-sm text-gray-400">Get a week's worth of posts from just 30 minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Your authentic voice</h4>
                <p className="text-sm text-gray-400">Content that sounds like you, not a robot.</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-6 bg-white/5 rounded-xl backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-white/20 rounded-full border-2 border-black flex items-center justify-center text-xs font-medium"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-300 ml-2">+2,842 founders</span>
            </div>
            <p className="text-sm text-gray-400">
              Join a community of ambitious founders growing their LinkedIn presence
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-2xl font-bold tracking-tight">AudioBrand</h1>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Create your account</h2>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-white font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
