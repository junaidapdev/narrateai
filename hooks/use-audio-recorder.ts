"use client"

import { useState, useRef, useEffect } from "react"

type RecordingState = "inactive" | "recording" | "paused"

interface AudioRecorderHook {
  audioURL: string | null
  recordingState: RecordingState
  recordingTime: number
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string | null>
  pauseRecording: () => void
  resumeRecording: () => void
  error: string | null
}

export function useAudioRecorder(): AudioRecorderHook {
  const [recordingState, setRecordingState] = useState<RecordingState>("inactive")
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const recordingTimeRef = useRef<number>(0)

  // Clean up function
  const cleanup = () => {
    console.log("Running cleanup in useAudioRecorder")

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          console.log("Stopping MediaRecorder in cleanup")
          mediaRecorderRef.current.stop()
        }
      } catch (err) {
        console.error("Error stopping media recorder:", err)
      }
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      try {
        console.log("Stopping all tracks in cleanup")
        streamRef.current.getTracks().forEach((track) => {
          console.log(`Stopping track: ${track.kind}`)
          track.stop()
        })
      } catch (err) {
        console.error("Error stopping tracks:", err)
      }
      streamRef.current = null
    }

    // Reset state but keep the last recording time
    startTimeRef.current = null
    setRecordingState("inactive")
  }

  // Add beforeunload event listener to ensure cleanup on page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("beforeunload event triggered")
      cleanup()
    }

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Add event listener for popstate (browser back/forward)
    window.addEventListener("popstate", handleBeforeUnload)

    // Clean up on unmount
    return () => {
      console.log("Component unmounting, running cleanup")
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handleBeforeUnload)
      cleanup()
    }
  }, [])

  // Timer function using requestAnimationFrame for more reliable timing
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    startTimeRef.current = Date.now() - recordingTimeRef.current * 1000

    const updateTimer = () => {
      if (startTimeRef.current === null) return

      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      recordingTimeRef.current = elapsedSeconds
      setRecordingTime(elapsedSeconds)
    }

    // Update immediately
    updateTimer()

    // Then update every second
    timerRef.current = setInterval(updateTimer, 1000)
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Save the current recording time
    recordingTimeRef.current = recordingTime
    startTimeRef.current = null
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)

      // Reset state
      recordingTimeRef.current = 0
      setRecordingTime(0)
      audioChunksRef.current = []
      setAudioURL(null)

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // Create recorder
      const options = { mimeType: "audio/webm" }
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      // Set up event handlers
      recorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size, "bytes")
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      // Start recording
      recorder.start(1000) // Collect data every second
      setRecordingState("recording")
      startTimer()

      console.log("Recording started successfully")
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(err instanceof Error ? err.message : "Failed to start recording")
      cleanup()
    }
  }

  // Stop recording
  const stopRecording = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (recordingState === "inactive" || !mediaRecorderRef.current) {
        console.log("No active recording to stop")
        resolve(audioURL)
        return
      }

      pauseTimer()

      try {
        // Function to finalize recording
        const finalizeRecording = () => {
          try {
            if (audioChunksRef.current.length === 0) {
              console.error("No audio data recorded")
              setError("No audio data recorded")
              setRecordingState("inactive")
              resolve(null)
              return
            }

            // Create blob and URL
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            console.log("Created audio blob:", audioBlob.size, "bytes")

            const url = URL.createObjectURL(audioBlob)
            console.log("Created audio URL:", url)

            setAudioURL(url)
            setRecordingState("inactive")

            // Clean up
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
            }

            resolve(url)
          } catch (err) {
            console.error("Error finalizing recording:", err)
            setError("Failed to process recording")
            setRecordingState("inactive")
            resolve(null)
          }
        }

        // If already inactive, finalize directly
        if (mediaRecorderRef.current.state === "inactive") {
          console.log("MediaRecorder already inactive, finalizing directly")
          finalizeRecording()
          return
        }

        // Otherwise, stop and wait for the stop event
        console.log("Stopping MediaRecorder")
        mediaRecorderRef.current.onstop = finalizeRecording
        mediaRecorderRef.current.stop()

        // Safety timeout in case onstop doesn't fire
        setTimeout(() => {
          if (recordingState !== "inactive") {
            console.log("Safety timeout triggered - finalizing recording")
            finalizeRecording()
          }
        }, 1000)
      } catch (err) {
        console.error("Error stopping recording:", err)
        setError("Failed to stop recording")
        setRecordingState("inactive")
        resolve(null)
      }
    })
  }

  // Pause recording
  const pauseRecording = () => {
    if (recordingState !== "recording" || !mediaRecorderRef.current) return

    try {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause()
        setRecordingState("paused")
        pauseTimer()
      }
    } catch (err) {
      console.error("Error pausing recording:", err)
      setError("Failed to pause recording")
    }
  }

  // Resume recording
  const resumeRecording = () => {
    if (recordingState !== "paused" || !mediaRecorderRef.current) return

    try {
      if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume()
        setRecordingState("recording")
        startTimer()
      }
    } catch (err) {
      console.error("Error resuming recording:", err)
      setError("Failed to resume recording")
    }
  }

  return {
    audioURL,
    recordingState,
    recordingTime,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  }
}
