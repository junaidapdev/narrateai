"use client"

import { useState, useEffect } from "react"
import { Brain } from "lucide-react"

export default function ProcessingScreen() {
  const [progress, setProgress] = useState(60)
  const [currentStep, setCurrentStep] = useState(1)
  const [brainScale, setBrainScale] = useState(1)

  // Animate the brain icon with a subtle pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setBrainScale((prev) => (prev === 1 ? 1.05 : 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Simulate progress increasing
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }

        // Update current step based on progress
        if (prev >= 30 && currentStep === 1) {
          setCurrentStep(2)
        } else if (prev >= 70 && currentStep === 2) {
          setCurrentStep(3)
        }

        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentStep])

  // Spinning animation for the transcribing step
  const getSpinningIcon = () => {
    return (
      <svg
        className="animate-spin h-4 w-4 text-white inline-block"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-white text-center mt-12">Processing...</h1>

      {/* Animated brain icon */}
      <div className="flex items-center justify-center my-16">
        <span className="text-2xl mr-4">⚡</span>
        <div className="transition-transform duration-1000 ease-in-out" style={{ transform: `scale(${brainScale})` }}>
          <Brain size={80} className="text-white" strokeWidth={1.5} />
        </div>
        <span className="text-2xl ml-4">⚡</span>
      </div>

      {/* Processing steps list */}
      <div className="px-5 mb-8">
        <ul className="space-y-6 text-base">
          <li className="flex items-center">
            <span className="text-[#34C759] mr-2">✓</span>
            <span className="text-white">Audio uploaded</span>
          </li>
          <li className="flex items-center">
            {currentStep >= 2 ? (
              <>
                {currentStep > 2 ? (
                  <span className="text-[#34C759] mr-2">✓</span>
                ) : (
                  <span className="mr-2">{getSpinningIcon()}</span>
                )}
                <span className="text-white">{currentStep > 2 ? "Transcription complete" : "Transcribing..."}</span>
              </>
            ) : (
              <>
                <span className="text-[#888888] mr-2">○</span>
                <span className="text-[#888888]">Transcribing</span>
              </>
            )}
          </li>
          <li className="flex items-center">
            {currentStep >= 3 ? (
              <>
                {progress === 100 ? (
                  <span className="text-[#34C759] mr-2">✓</span>
                ) : (
                  <span className="mr-2">{getSpinningIcon()}</span>
                )}
                <span className="text-white">{progress === 100 ? "Posts generated" : "Generating posts..."}</span>
              </>
            ) : (
              <>
                <span className="text-[#888888] mr-2">○</span>
                <span className="text-[#888888]">Generating posts</span>
              </>
            )}
          </li>
        </ul>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col items-center mt-10">
        <div className="w-52 h-1 bg-[#333333] rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-sm text-[#888888] mt-2">{progress}%</span>
      </div>

      {/* Time estimate */}
      <div className="text-center mt-4">
        <p className="text-sm text-[#888888]">Est. time: {Math.max(1, Math.ceil((100 - progress) / 20))} min</p>
      </div>

      {/* Tip section */}
      <div className="text-center mt-10 max-w-[280px] mx-auto">
        <p className="text-sm text-[#888888]">
          💡 Your posts will be optimized for LinkedIn engagement with relevant hashtags and formatting
        </p>
      </div>

      {/* Run in Background button */}
      <div className="mt-auto mb-5">
        <button className="w-full h-11 border border-[#333333] text-white rounded-xl">Run in Background</button>
      </div>
    </div>
  )
}
