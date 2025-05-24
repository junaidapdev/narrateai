"use client"

import { useState, useRef, useEffect } from "react"

interface SimpleRecorderHook {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  audioURL: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<string | null>
  pauseRecording: () => void
  resumeRecording: () => void
  error: string | null
}

export function useSimpleRecorder(): SimpleRecorderHook {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop()
        }
      } catch (err) {
        console.error("Error stopping media recorder:", err)
      }
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return cleanup
  }, [])

  // Timer function
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)

      // Reset state
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
      setIsRecording(true)
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
      if (!isRecording || !mediaRecorderRef.current) {
        resolve(audioURL)
        return
      }

      pauseTimer()

      try {
        // Function to finalize recording
        const finalizeRecording = () => {
          try {
            if (audioChunksRef.current.length === 0) {
              setError("No audio data recorded")
              setIsRecording(false)
              resolve(null)
              return
            }

            // Create blob and URL
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
            console.log("Created audio blob:", audioBlob.size, "bytes")

            const url = URL.createObjectURL(audioBlob)
            console.log("Created audio URL:", url)

            setAudioURL(url)
            setIsRecording(false)

            // Clean up
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop())
            }

            resolve(url)
          } catch (err) {
            console.error("Error finalizing recording:", err)
            setError("Failed to process recording")
            setIsRecording(false)
            resolve(null)
          }
        }

        // If already inactive, finalize directly
        if (mediaRecorderRef.current.state === "inactive") {
          finalizeRecording()
          return
        }

        // Otherwise, stop and wait for the stop event
        mediaRecorderRef.current.onstop = finalizeRecording
        mediaRecorderRef.current.stop()

        // Safety timeout in case onstop doesn't fire
        setTimeout(() => {
          if (isRecording) {
            console.log("Safety timeout triggered - finalizing recording")
            finalizeRecording()
          }
        }, 1000)
      } catch (err) {
        console.error("Error stopping recording:", err)
        setError("Failed to stop recording")
        setIsRecording(false)
        resolve(null)
      }
    })
  }

  // Pause recording
  const pauseRecording = () => {
    if (!isRecording || isPaused || !mediaRecorderRef.current) return

    try {
      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        pauseTimer()
      }
    } catch (err) {
      console.error("Error pausing recording:", err)
      setError("Failed to pause recording")
    }
  }

  // Resume recording
  const resumeRecording = () => {
    if (!isRecording || !isPaused || !mediaRecorderRef.current) return

    try {
      if (mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        startTimer()
      }
    } catch (err) {
      console.error("Error resuming recording:", err)
      setError("Failed to resume recording")
    }
  }

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioURL,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    error,
  }
}
