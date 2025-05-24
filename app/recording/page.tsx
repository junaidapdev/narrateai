"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { X, Mic, Check } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { formatTime } from "@/utils/format-time"
import AudioVisualizer from "@/components/audio/audio-visualizer"
import { createRecordingClient } from "@/services/recording-service"

export default function RecordingPage() {
  const router = useRouter()
  const [browserSupported, setBrowserSupported] = useState(true)
  const [isStoppingRecording, setIsStoppingRecording] = useState(false)
  const [remainingTime, setRemainingTime] = useState(30 * 60) // 30 minutes in seconds
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [recordingError, setRecordingError] = useState<string | null>(null)
  const [recordingTitle, setRecordingTitle] = useState("New Recording")
  const [isInitializing, setIsInitializing] = useState(true)
  const hasStartedRecording = useRef(false)
  const isUnmountingRef = useRef(false)
  const mountedRef = useRef(false)

  // Use our audio recorder hook
  const {
    audioURL,
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  } = useAudioRecorder()

  // Check browser compatibility and start recording automatically
  useEffect(() => {
    // Prevent double initialization in development due to React.StrictMode
    if (mountedRef.current) return
    mountedRef.current = true

    console.log("Recording page mounted and initializing")

    const checkBrowserSupport = () => {
      if (typeof window !== "undefined") {
        const isMediaRecorderSupported = "MediaRecorder" in window
        const isUserMediaSupported = "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices

        if (!isMediaRecorderSupported || !isUserMediaSupported) {
          console.error("Browser does not support required audio recording APIs")
          setBrowserSupported(false)
          return false
        }
        return true
      }
      return false
    }

    const isSupported = checkBrowserSupport()

    if (isSupported && !hasStartedRecording.current) {
      // Start recording with a slight delay to ensure component is fully mounted
      setTimeout(() => {
        if (!isUnmountingRef.current) {
          handleStartRecording()
          setIsInitializing(false)
        }
      }, 300)
    } else {
      setIsInitializing(false)
    }

    // Cleanup function for component unmount
    return () => {
      console.log("Recording page unmounting")
      isUnmountingRef.current = true

      // If we're recording, make sure to stop
      if (recordingState !== "inactive") {
        console.log("Stopping recording on unmount")
        stopRecording().catch((err) => {
          console.error("Error stopping recording on unmount:", err)
        })
      }
    }
  }, []) // Empty dependency array to run only once

  // Update remaining time
  useEffect(() => {
    if (recordingState === "recording") {
      const interval = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [recordingState])

  // Format time as HH:MM:SS
  const formatDetailedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle start recording
  const handleStartRecording = async () => {
    try {
      setRemainingTime(30 * 60)
      setPermissionDenied(false)
      setRecordingError(null)
      hasStartedRecording.current = true

      await startRecording()
    } catch (err) {
      console.error("Failed to start recording:", err)
      if (err instanceof Error && err.name === "NotAllowedError") {
        setPermissionDenied(true)
      }
    }
  }

  // Handle toggle pause/resume
  const handleTogglePause = () => {
    if (recordingState === "paused") {
      resumeRecording()
    } else {
      pauseRecording()
    }
  }

  // Handle stop recording
  const handleStopRecording = async () => {
    if (recordingTime < 1) {
      // If recording is too short, just cancel
      router.push("/dashboard")
      return
    }

    try {
      setIsStoppingRecording(true)

      // Wait for the stopRecording Promise to resolve with the URL
      const url = await stopRecording()
      console.log("Received audio URL after stopping:", url)

      // If we're unmounting, don't continue
      if (isUnmountingRef.current) {
        console.log("Component is unmounting, not proceeding with recording save")
        return
      }

      // Create a recording in the database
      const result = await createRecordingClient({
        title: recordingTitle,
        duration: recordingTime,
        audio_url: url || null,
        status: "completed",
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to create recording")
      }

      const recordingId = result.data.id

      // If we have a URL, try to upload the audio
      if (url) {
        try {
          // Store the audio URL in sessionStorage for the review page
          sessionStorage.setItem("recordedAudioURL", url)
          sessionStorage.setItem("recordingDuration", recordingTime.toString())
          sessionStorage.setItem("recordingId", recordingId)

          // Navigate to review page
          router.push("/recording/review")
        } catch (err) {
          console.error("Error processing audio:", err)
          // Even if this fails, we've saved the recording metadata
          router.push(`/dashboard`)
        }
      } else {
        console.warn("No audio URL available after stopping recording")
        setRecordingError("Audio recording was not captured properly. Please try again.")

        // Navigate to dashboard anyway
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err) {
      console.error("Error in handleStopRecording:", err)
      setRecordingError("An error occurred while stopping the recording.")
    } finally {
      setIsStoppingRecording(false)
    }
  }

  // Handle cancel recording
  const handleCancelRecording = () => {
    stopRecording()
      .then(() => {
        router.push("/dashboard")
      })
      .catch((err) => {
        console.error("Error stopping recording during cancel:", err)
        router.push("/dashboard")
      })
  }

  // Show error screen if browser not supported
  if (!browserSupported) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-5">
        <h1 className="text-2xl font-semibold text-white mb-4">Browser Not Supported</h1>
        <p className="text-[#888888] text-center mb-8 max-w-xs">
          Your browser does not support the audio recording features required for this application. Please use a modern
          browser such as Chrome, Firefox, Safari, or Edge.
        </p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-zinc-800 text-white rounded-lg">
          Return to Dashboard
        </button>
      </div>
    )
  }

  // Show permission denied screen
  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-5">
        <h1 className="text-2xl font-semibold text-white mb-4">Microphone Access Required</h1>
        <p className="text-[#888888] text-center mb-8 max-w-xs">
          Please allow microphone access in your browser settings and try again.
        </p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-3 bg-zinc-800 text-white rounded-lg">
          Return to Dashboard
        </button>
      </div>
    )
  }

  // Show initializing screen
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Initializing microphone...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-10">
        {/* Status indicator */}
        {recordingState === "paused" && (
          <div className="flex items-center mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
            <span className="text-gray-400 text-xs">Paused</span>
          </div>
        )}

        {/* Timer display */}
        <div className="mb-4 text-center">
          <h1 className="text-5xl text-white font-mono tracking-wider">{formatDetailedTime(recordingTime)}</h1>
          <p className="text-gray-400 text-xs mt-2">{formatTime(remainingTime)} remaining</p>
        </div>

        {/* Waveform visualization */}
        <div className="w-full h-24 mb-8 bg-black border border-zinc-800 rounded-lg overflow-hidden">
          <AudioVisualizer isPaused={recordingState === "paused"} />
        </div>

        {/* Tips section */}
        <div className="text-center max-w-xs">
          <p className="text-gray-400 text-xs mb-1.5">Speak clearly about topics you want to share on LinkedIn.</p>
          <p className="text-gray-400 text-xs">Include key points, stories, and insights.</p>
        </div>

        {/* Error message */}
        {(recordingError || error) && (
          <div className="mt-4 p-2 bg-[#2C1215] border border-[#5C2327] rounded-lg max-w-xs">
            <p className="text-xs text-[#FF3B30]">{recordingError || error}</p>
          </div>
        )}
      </div>

      {/* Recording controls at bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <div className="bg-black border-t border-zinc-900 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Cancel button */}
            <button
              onClick={handleCancelRecording}
              className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
              disabled={isStoppingRecording}
            >
              <X size={16} className="text-white" />
              <span className="sr-only">Cancel</span>
            </button>

            {/* Pause/Resume button */}
            <button
              onClick={handleTogglePause}
              className="w-12 h-12 rounded-full bg-transparent border border-white flex items-center justify-center"
              disabled={isStoppingRecording}
            >
              <Mic size={18} className="text-white" />
              <span className="sr-only">{recordingState === "paused" ? "Resume" : "Pause"}</span>
            </button>

            {/* Done button */}
            <button
              onClick={handleStopRecording}
              className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
              disabled={isStoppingRecording}
            >
              {isStoppingRecording ? (
                <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Check size={16} className="text-white" />
              )}
              <span className="sr-only">Done</span>
            </button>
          </div>

          {/* Button labels */}
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-white text-[10px] text-center w-10">Cancel</span>
            <span className="text-white text-[10px] text-center w-12">
              {recordingState === "paused" ? "Resume" : "Pause"}
            </span>
            <span className="text-white text-[10px] text-center w-10">Done</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
