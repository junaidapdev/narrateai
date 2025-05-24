"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Play, Pause, CheckCircle, Trash2 } from "lucide-react"
import { formatTime } from "@/utils/format-time"
import AudioVisualizer from "@/components/audio/audio-visualizer"

export default function ReviewPage() {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [isDeleting, setIsDeleting] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Get the recorded audio from sessionStorage
  useEffect(() => {
    const storedAudioURL = sessionStorage.getItem("recordedAudioURL")
    const storedDuration = sessionStorage.getItem("recordingDuration")

    if (storedAudioURL) {
      setAudioURL(storedAudioURL)
    } else {
      // If no audio URL is found, redirect back to recording page
      router.push("/recording")
    }

    if (storedDuration) {
      setDuration(Number.parseInt(storedDuration, 10))
    }
  }, [router])

  // Initialize audio element
  useEffect(() => {
    if (audioURL && !audioRef.current) {
      const audio = new Audio(audioURL)
      audioRef.current = audio

      audio.addEventListener("timeupdate", () => {
        const currentProgress = (audio.currentTime / audio.duration) * 100
        setProgress(currentProgress)
        setCurrentTime(formatTime(audio.currentTime))
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setProgress(100)
      })

      audio.addEventListener("loadedmetadata", () => {
        // If we don't have a duration from sessionStorage, use the audio duration
        if (duration === 0) {
          setDuration(Math.round(audio.duration))
        }
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [audioURL, duration])

  // Format duration as MM:SS
  const formattedDuration = formatTime(duration)

  // Toggle play/pause
  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  // Handle seek on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return

    const progressBar = e.currentTarget
    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedProgress = (x / rect.width) * 100

    // Update progress
    setProgress(clickedProgress)

    // Update audio time
    const newTime = (clickedProgress / 100) * audioRef.current.duration
    audioRef.current.currentTime = newTime
    setCurrentTime(formatTime(newTime))

    // If audio was paused, start playing
    if (!isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // Handle process audio
  const handleProcessAudio = () => {
    // In a real app, you would upload the audio to your server or cloud storage
    // For now, we'll just navigate to the processing page
    router.push("/processing")
  }

  // Handle delete & re-record
  const handleDelete = () => {
    setIsDeleting(true)

    // Clean up audio resources
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }

    // Clear sessionStorage
    sessionStorage.removeItem("recordedAudioURL")
    sessionStorage.removeItem("recordingDuration")

    setTimeout(() => {
      router.push("/recording")
    }, 500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <motion.div
        className="px-5 py-4 border-b border-[#222222]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <button onClick={() => router.push("/recording")} className="text-white">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-white ml-4">Review Recording</h1>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 px-5 py-6">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {/* Recording info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-base">
                Today • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex items-center">
                <span className="text-[#888888] text-sm">{formattedDuration}</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <CheckCircle size={14} className="text-[#34C759] mr-1" />
                <span className="text-sm text-[#888888]">Good audio quality</span>
              </div>
            </div>
          </div>

          {/* Audio player */}
          <div className="bg-[#111111] rounded-xl p-5">
            {/* Play button */}
            <div className="flex justify-center mb-6">
              <button
                className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause size={28} className="text-white" />
                ) : (
                  <Play size={28} className="text-white ml-1" />
                )}
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="h-2 bg-[#333333] rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-white">{currentTime}</span>
                <span className="text-sm text-[#888888]">{formattedDuration}</span>
              </div>
            </div>
          </div>

          {/* Waveform visualization */}
          <div className="h-24 bg-[#111111] rounded-xl overflow-hidden">
            <AudioVisualizer audioURL={audioURL} isPlaying={isPlaying} />
          </div>

          {/* Action buttons */}
          <div className="space-y-4 mt-8">
            <button
              onClick={handleProcessAudio}
              className="w-full py-4 bg-[#1C1C1E] text-white rounded-xl font-medium flex items-center justify-center"
            >
              Process Audio
            </button>

            <button
              onClick={handleDelete}
              className="w-full py-4 border border-[#333333] text-[#FF3B30] rounded-xl font-medium flex items-center justify-center"
            >
              <Trash2 size={16} className="mr-2" />
              Delete & Re-record
            </button>
          </div>

          {/* Info text */}
          <div className="text-center mt-4">
            <p className="text-sm text-[#888888]">Processing will take 3-5 minutes</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
