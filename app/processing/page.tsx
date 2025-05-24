"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabaseBrowser } from "@/lib/supabase"
import { generatePostFromRecording } from "@/actions/post-generation"
import { updateRecordingTranscript } from "@/services/recording-service"

// Client-side transcription function
async function transcribeAudioClient(audioUrl: string, recordingId: string) {
  try {
    console.log("[CLIENT] Starting transcription for recording:", recordingId)

    // Get the audio blob
    const response = await fetch(audioUrl)
    const audioBlob = await response.blob()

    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.webm")
    formData.append("recordingId", recordingId)

    // Send the audio to our API endpoint for transcription
    const transcriptionResponse = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      throw new Error(`Transcription API error: ${errorText}`)
    }

    const result = await transcriptionResponse.json()

    if (!result.success) {
      throw new Error(result.error || "Transcription failed")
    }

    return {
      success: true,
      transcript: result.transcript,
    }
  } catch (error) {
    console.error("Transcription error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown transcription error",
    }
  }
}

export default function ProcessingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [detailedError, setDetailedError] = useState<string | null>(null)

  // Step labels
  const steps = ["Uploading", "Transcribing", "Generating Post"]

  // Process audio function
  const processAudio = useCallback(
    async (audioURL: string, recordingId: string) => {
      try {
        // Step 1: Upload audio
        setCurrentStep(0)

        // Simulate upload progress
        const uploadInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 30) {
              clearInterval(uploadInterval)
              return 30
            }
            return prev + 1
          })
        }, 100)

        // Get the audio blob
        const response = await fetch(audioURL)
        const audioBlob = await response.blob()

        // Upload the audio blob to Supabase storage
        const supabase = getSupabaseBrowser()

        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("User not authenticated")
        }

        // Create a unique file path
        const filePath = `${user.id}/${Date.now()}-recording.webm`

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("recordings")
          .upload(filePath, audioBlob, {
            contentType: "audio/webm",
          })

        if (uploadError) {
          throw new Error(`Failed to upload audio: ${uploadError.message}`)
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage.from("recordings").getPublicUrl(filePath)
        const audioUrl = publicUrlData.publicUrl

        // Update the recording with the audio URL
        const { error: updateError } = await supabase
          .from("recordings")
          .update({
            audio_url: audioUrl,
            status: "processing",
          })
          .eq("id", recordingId)

        if (updateError) {
          throw new Error(`Failed to update recording: ${updateError.message}`)
        }

        // Clear the upload interval and set progress to 30%
        clearInterval(uploadInterval)
        setProgress(30)

        // Step 2: Transcribe audio
        setCurrentStep(1)

        // Simulate transcription progress
        const transcriptionInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 70) {
              clearInterval(transcriptionInterval)
              return 70
            }
            return prev + 1
          })
        }, 100)

        // Transcribe the audio using our client-side function
        const transcriptionResult = await transcribeAudioClient(audioUrl, recordingId)

        // Clear the transcription interval and set progress to 70%
        clearInterval(transcriptionInterval)
        setProgress(70)

        if (!transcriptionResult.success) {
          throw new Error(transcriptionResult.error || "Transcription failed")
        }

        // Save the transcript to the recording
        const updateResult = await updateRecordingTranscript(recordingId, transcriptionResult.transcript)

        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to save transcript")
        }

        // Step 3: Generate post
        setCurrentStep(2)

        // Simulate post generation progress
        const postGenerationInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 95) {
              clearInterval(postGenerationInterval)
              return 95
            }
            return prev + 1
          })
        }, 50)

        // Wait a moment to ensure the transcript is saved
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Generate LinkedIn post automatically
        console.log("Starting post generation...")
        const postResult = await generatePostFromRecording({
          recordingId,
          userId: user.id,
          platform: "linkedin", // Default to LinkedIn
        })

        // Clear the post generation interval and set progress to 100%
        clearInterval(postGenerationInterval)
        setProgress(100)

        if (!postResult.success) {
          console.error("Post generation failed:", postResult.error)
          setDetailedError(postResult.error || "Unknown error during post generation")
          throw new Error(postResult.error || "Failed to generate post")
        }

        console.log("Post generation successful, post ID:", postResult.postId)

        // Wait a moment to show 100% completion
        setTimeout(() => {
          // Redirect to the posts page
          router.push("/posts")
        }, 1000)
      } catch (err) {
        console.error("Error processing audio:", err)
        setError(err instanceof Error ? err.message : "An error occurred while processing your audio")
      }
    },
    [router],
  )

  // Initialize from URL params or session storage
  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) return

    // Get data from URL params or session storage
    const urlAudioURL = searchParams.get("audioURL")
    const urlRecordingId = searchParams.get("recordingId")

    const storedAudioURL = sessionStorage.getItem("recordedAudioURL")
    const storedRecordingId = sessionStorage.getItem("recordingId")

    // Use URL params if available, otherwise use session storage
    const finalAudioURL = urlAudioURL || storedAudioURL
    const finalRecordingId = urlRecordingId || storedRecordingId

    // Update state
    setAudioURL(finalAudioURL)
    setRecordingId(finalRecordingId)

    // Mark as initialized
    setInitialized(true)

    // Validate required data
    if (!finalAudioURL) {
      setError("No audio URL found. Please go back and record audio first.")
      return
    }

    if (!finalRecordingId) {
      setError("No recording ID found. Please go back and record audio first.")
      return
    }

    // Start processing
    processAudio(finalAudioURL, finalRecordingId)
  }, [searchParams, processAudio, initialized])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md px-4">
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-4 bg-black border border-red-500 rounded-lg"
            >
              <p className="text-red-500 text-sm">{error}</p>
              {detailedError && <p className="mt-2 text-red-400 text-xs">Details: {detailedError}</p>}
              <div className="mt-4 flex flex-col space-y-2">
                <button
                  onClick={() => router.push("/recording")}
                  className="px-4 py-2 bg-black border border-white/20 text-white rounded-lg text-xs hover:bg-white/10 transition-colors"
                >
                  Go Back to Recording
                </button>
                {recordingId && (
                  <button
                    onClick={() => router.push(`/posts?recordingId=${recordingId}`)}
                    className="px-4 py-2 bg-black border border-white/20 text-white rounded-lg text-xs hover:bg-white/10 transition-colors"
                  >
                    View Posts
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing UI */}
        {!error && (
          <div className="space-y-12">
            {/* Progress circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                {/* Background circle */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="2" />
                  {/* Progress circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>

                {/* Percentage in the middle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-light">{Math.round(progress)}%</span>
                </div>
              </div>

              {/* Current step label */}
              <div className="mt-4 text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium"
                  >
                    {steps[currentStep]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex justify-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? "bg-white" : index < currentStep ? "bg-gray-400" : "bg-gray-800"
                  }`}
                />
              ))}
            </div>

            {/* Cancel button */}
            {progress < 100 && (
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/recording")}
                  className="px-6 py-2 bg-black border border-white/20 text-white rounded-full text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
