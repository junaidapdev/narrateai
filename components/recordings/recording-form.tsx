"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createRecording } from "@/actions/recordings"
import { Loader2 } from "lucide-react"

export default function RecordingForm() {
  const [title, setTitle] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Start recording
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // In a real app, this would use the Web Audio API to record audio
    // For now, we'll just simulate recording with a timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
  }

  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)

    // In a real app, this would save the recorded audio and get a URL
    // For now, we'll just simulate with a fake URL
    setAudioUrl("https://example.com/recording.mp3")
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!audioUrl) {
      setError("No recording available")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("duration", recordingTime.toString())
      formData.append("audioUrl", audioUrl)

      const result = await createRecording(formData)

      if (result.success) {
        setSuccess(true)
        setTitle("")
        setRecordingTime(0)
        setAudioUrl(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Failed to save recording")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#111111] rounded-xl p-5">
      <h2 className="text-xl font-semibold text-white mb-4">New Recording</h2>

      {success && (
        <div className="mb-4 p-3 bg-[#1C392E] border border-[#2A5E45] rounded-lg">
          <p className="text-[#34C759] text-sm">Recording saved successfully!</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[#2C1215] border border-[#5C2327] rounded-lg">
          <p className="text-[#FF3B30] text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-[#888888] mb-2">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 bg-[#1C1C1E] text-white border-none rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-white"
            placeholder="My recording"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-[#888888]">Recording</label>
            {recordingTime > 0 && <span className="text-sm text-white">{formatTime(recordingTime)}</span>}
          </div>

          {!isRecording && !audioUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full h-12 bg-[#1C1C1E] text-white rounded-lg flex items-center justify-center"
              disabled={isSubmitting}
            >
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full h-12 bg-[#FF3B30] text-white rounded-lg flex items-center justify-center"
              disabled={isSubmitting}
            >
              Stop Recording
            </button>
          )}

          {audioUrl && !isRecording && (
            <div className="flex items-center justify-between bg-[#1C1C1E] rounded-lg p-3">
              <span className="text-white">Recording ready</span>
              <button type="button" onClick={startRecording} className="text-[#5856D6] text-sm" disabled={isSubmitting}>
                Record Again
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-white text-black rounded-xl font-semibold flex items-center justify-center"
          disabled={!audioUrl || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Recording"
          )}
        </button>
      </form>
    </div>
  )
}
