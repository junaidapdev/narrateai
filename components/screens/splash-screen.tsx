"use client"

import { useEffect, useState } from "react"
import { Mic } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SplashScreen() {
  const [opacity, setOpacity] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Fade in animation
    const fadeTimer = setTimeout(() => {
      setOpacity(1)
    }, 100)

    return () => {
      clearTimeout(fadeTimer)
    }
  }, [])

  const handleGetStarted = () => {
    router.push("/onboarding")
  }

  return (
    <div
      className="flex flex-col items-center justify-between min-h-screen bg-black px-5 py-12"
      style={{
        opacity: opacity,
        transition: "opacity 1s ease-in-out",
      }}
    >
      <div className="flex-1" />

      <div className="flex flex-col items-center justify-center space-y-6 max-w-xs mx-auto">
        <div className="relative w-14 h-14 rounded-full bg-black border border-gray-800 flex items-center justify-center mb-2">
          <Mic className="w-6 h-6 text-white" strokeWidth={1.5} />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-white leading-tight">
            Build Your LinkedIn Brand in <span className="text-white">Just 10 Minutes</span> a Day
          </h1>

          <p className="text-sm text-gray-400 max-w-xs">
            Turn your voice into engaging LinkedIn content—all from your phone
          </p>
        </div>
      </div>

      <div className="mt-12 mb-8">
        <button
          onClick={handleGetStarted}
          className="px-6 py-3 bg-white text-black font-medium rounded-full text-sm transition-all hover:bg-gray-100"
        >
          Get Started for free
        </button>
      </div>
    </div>
  )
}
