"use client"

import Link from "next/link"
import { useState } from "react"

export default function OnboardingScreen() {
  const [currentPage] = useState(0)

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black px-5 py-12">
      <div className="w-full flex flex-col items-center mt-8">
        <h1 className="text-3xl font-medium text-white mb-16">Welcome!</h1>

        {/* Microphone to Document Illustration */}
        <div className="w-full h-48 flex items-center justify-center mb-12">
          <svg
            width="240"
            height="120"
            viewBox="0 0 240 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-white"
          >
            {/* Microphone */}
            <rect x="40" y="30" width="30" height="50" rx="15" strokeWidth="1.5" />
            <path d="M30 60C30 60 30 80 55 80C80 80 80 60 80 60" strokeWidth="1.5" />
            <line x1="55" y1="80" x2="55" y2="95" strokeWidth="1.5" />
            <line x1="40" y1="95" x2="70" y2="95" strokeWidth="1.5" />

            {/* Transformation Lines */}
            <path d="M90 60 L110 60" strokeWidth="1.5" strokeDasharray="4 2" />

            {/* Document Cards */}
            <rect x="130" y="25" width="30" height="40" rx="2" strokeWidth="1.5" />
            <rect x="140" y="35" width="30" height="40" rx="2" strokeWidth="1.5" />
            <rect x="150" y="45" width="30" height="40" rx="2" strokeWidth="1.5" />
            <rect x="160" y="55" width="30" height="40" rx="2" strokeWidth="1.5" />

            {/* Document Lines */}
            <line x1="135" y1="35" x2="155" y2="35" strokeWidth="1" />
            <line x1="135" y1="40" x2="150" y2="40" strokeWidth="1" />
            <line x1="145" y1="45" x2="165" y2="45" strokeWidth="1" />
            <line x1="145" y1="50" x2="160" y2="50" strokeWidth="1" />
            <line x1="155" y1="55" x2="175" y2="55" strokeWidth="1" />
            <line x1="155" y1="60" x2="170" y2="60" strokeWidth="1" />
            <line x1="165" y1="65" x2="185" y2="65" strokeWidth="1" />
            <line x1="165" y1="70" x2="180" y2="70" strokeWidth="1" />
          </svg>
        </div>

        <p className="text-lg text-white text-center leading-relaxed mb-16">
          Turn 30 mins of audio into 7 LinkedIn posts
        </p>

        {/* Pagination Dots */}
        <div className="flex space-x-4 mb-16">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentPage ? "bg-white" : "border border-white"}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col items-center">
        <button className="w-full h-12 bg-[#1C1C1E] text-white rounded-xl mb-6">Get Started →</button>

        <div className="text-base">
          <span className="text-[#888888]">Already have account? </span>
          <Link href="/signin" className="text-white">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
