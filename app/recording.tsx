"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Pause, Square } from "lucide-react"

export default function RecordingScreen() {
  const [recordingTime, setRecordingTime] = useState(0) // in seconds
  const [remainingTime, setRemainingTime] = useState(30 * 60) // 30 minutes in seconds
  const [isPaused, setIsPaused] = useState(false)
  const waveformRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  // Format time as MM:SS:ms
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const milliseconds = Math.floor((timeInSeconds % 1) * 100)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`
  }

  // Format remaining time as MM:SS
  const formatRemainingTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Animate the waveform
  const animateWaveform = () => {
    const canvas = waveformRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set line style
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1

    // Draw the waveform
    const centerY = canvas.height / 2
    const numLines = Math.floor(canvas.width / 3)

    for (let i = 0; i < numLines; i++) {
      const x = i * 3

      // Generate a random amplitude that changes over time
      // This creates a more realistic audio waveform effect
      const time = Date.now() / 1000
      const frequency = 0.5 + Math.sin(time * 0.2) * 0.2
      const amplitude = Math.sin(i * frequency + time * 5) * 20

      // Add some randomness to make it look more natural
      const randomFactor = Math.random() * 10

      // Calculate the height based on position (center is louder)
      const positionFactor = 1 - Math.abs((i - numLines / 2) / (numLines / 2)) * 0.5

      // Combine all factors for final amplitude
      const finalAmplitude = amplitude * positionFactor * (isPaused ? 0.2 : 1) + randomFactor

      // Draw the line
      ctx.beginPath()
      ctx.moveTo(x, centerY - finalAmplitude)
      ctx.lineTo(x, centerY + finalAmplitude)
      ctx.stroke()

      // Vary opacity for visual interest
      ctx.globalAlpha = 0.7 + Math.random() * 0.3
    }

    // Reset opacity
    ctx.globalAlpha = 1

    // Continue animation
    animationRef.current = requestAnimationFrame(animateWaveform)
  }

  // Start/stop recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (!isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1)
        setRemainingTime((prev) => Math.max(0, prev - 0.1))
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPaused])

  // Start waveform animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animateWaveform)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPaused])

  // Handle pause/resume
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Handle stop recording
  const stopRecording = () => {
    // In a real app, this would stop the recording and navigate to the next screen
    console.log("Recording stopped")
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Top bar */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="text-white text-base">
          Cancel
        </Link>
        <button className="text-white text-base">Done</button>
      </div>

      {/* Timer display */}
      <div className="mt-16 mb-12 text-center">
        <h1 className="text-5xl text-white font-mono">{formatTime(recordingTime)}</h1>
      </div>

      {/* Waveform visualization */}
      <div className="h-32 mb-6">
        <canvas
          ref={waveformRef}
          className="w-full h-full"
          width={window ? window.innerWidth - 40 : 335}
          height={120}
        />
      </div>

      {/* Recording indicator */}
      <div className="flex items-center justify-center mb-12">
        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
        <span className="text-white text-base">Recording</span>
      </div>

      {/* Control buttons */}
      <div className="flex justify-center space-x-8 mb-12">
        <button
          className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center active:opacity-70 transition-opacity"
          onClick={togglePause}
        >
          <Pause size={24} className="text-white" />
        </button>
        <button
          className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center active:opacity-70 transition-opacity"
          onClick={stopRecording}
        >
          <Square size={24} className="text-white" />
        </button>
      </div>

      {/* Tips section */}
      <div className="px-5 mb-8">
        <ul className="text-sm text-[#888888] space-y-2">
          <li>• Speak clearly and at a normal pace</li>
          <li>• Include key points you want in your posts</li>
          <li>• Pause briefly between different topics</li>
        </ul>
      </div>

      {/* Time remaining */}
      <div className="text-center mt-auto mb-6">
        <p className="text-sm text-[#888888]">Time remaining: {formatRemainingTime(remainingTime)}</p>
      </div>
    </div>
  )
}
