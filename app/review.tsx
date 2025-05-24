"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Play, Pause, CheckCircle } from "lucide-react"

export default function ReviewScreen() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("00:00")
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Total duration in seconds (30:15)
  const totalDuration = 30 * 60 + 15
  const formattedDuration = "30:15"

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }

          // Calculate current time based on progress
          const currentTimeInSeconds = Math.floor((prev / 100) * totalDuration)
          setCurrentTime(formatTime(currentTimeInSeconds))

          return prev + 0.1
        })
      }, 100)
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, totalDuration])

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/recording" className="flex items-center text-white">
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-base">Back</span>
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-white text-center">Review Recording</h1>

      {/* Duration display */}
      <div className="mt-8">
        <p className="text-base text-white">Duration: {formattedDuration}</p>
      </div>

      {/* Audio player */}
      <div className="mt-8 bg-[#111111] rounded-xl p-6">
        <div className="flex flex-col items-center mb-6">
          <button
            className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-2 active:opacity-70 transition-opacity"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
          </button>
          <span className="text-base text-white">Play Recording</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center">
          <div className="flex-1 h-2 bg-[#333333] rounded-full overflow-hidden mr-3">
            <div className="h-full bg-white" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-sm text-white">{currentTime}</span>
        </div>
      </div>

      {/* Audio quality indicator */}
      <div className="mt-6 flex items-center">
        <span className="text-sm text-[#888888]">Audio Quality: </span>
        <span className="text-sm text-[#888888] ml-1">Good </span>
        <CheckCircle size={14} className="text-[#34C759] ml-1" />
      </div>

      {/* Action buttons */}
      <div className="mt-12">
        <button className="w-full h-12 bg-[#1C1C1E] text-white rounded-xl font-semibold">Process Audio</button>

        <button className="w-full h-12 border border-[#333333] text-[#FF3B30] rounded-xl font-semibold mt-4">
          Delete & Re-record
        </button>
      </div>

      {/* Info text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#888888]">Processing will take 3-5 minutes</p>
      </div>
    </div>
  )
}
