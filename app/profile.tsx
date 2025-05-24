"use client"

import { useState } from "react"
import Link from "next/link"
import { Settings, ChevronRight, User } from "lucide-react"

export default function ProfileScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Handle sign out
  const handleSignOut = () => {
    setIsSigningOut(true)
    // In a real app, this would sign the user out
    setTimeout(() => {
      setIsSigningOut(false)
      alert("Signed out successfully")
    }, 1000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <button className="text-white">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* User section */}
      <div className="flex flex-col items-center mt-8 mb-10">
        <div className="w-16 h-16 rounded-full border border-white flex items-center justify-center mb-3">
          <User size={40} className="text-white" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-semibold text-white mb-1">Alex Johnson</h2>
        <p className="text-sm text-[#888888]">alex.johnson@example.com</p>
      </div>

      {/* Account Settings section */}
      <div className="mb-6">
        <h3 className="text-xs text-[#888888] uppercase mb-4">Account Settings</h3>
        <div className="space-y-px">
          <Link
            href="/profile/personal-info"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Personal Information</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/subscription"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Subscription</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/notifications"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Notifications</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/privacy"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Privacy</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
        </div>
      </div>

      {/* Support section */}
      <div className="mb-6">
        <h3 className="text-xs text-[#888888] uppercase mb-4">Support</h3>
        <div className="space-y-px">
          <Link
            href="/profile/help"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Help Center</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/contact"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Contact Us</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/feedback"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Give Feedback</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
        </div>
      </div>

      {/* About section */}
      <div className="mb-8">
        <h3 className="text-xs text-[#888888] uppercase mb-4">About</h3>
        <div className="space-y-px">
          <Link
            href="/profile/terms"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Terms of Service</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
          <Link
            href="/profile/privacy-policy"
            className="flex justify-between items-center py-4 border-b border-[#222222] active:bg-[#111111] transition-colors"
          >
            <span className="text-base text-white">Privacy Policy</span>
            <ChevronRight size={18} className="text-[#888888]" />
          </Link>
        </div>
      </div>

      {/* Sign Out button */}
      <button
        className="w-full h-11 border border-[#FF3B30] text-[#FF3B30] rounded-xl mt-8 active:bg-[#FF3B30]/10 transition-colors"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? "Signing out..." : "Sign Out"}
      </button>

      {/* Version number */}
      <div className="mt-auto mb-4 text-center">
        <p className="text-xs text-[#888888]">Version 1.0.4</p>
      </div>
    </div>
  )
}
