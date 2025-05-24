"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getRecording } from "@/actions/recordings"
import { ArrowLeft, Loader2, AlertCircle, Headphones } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import TranscriptViewer from "@/components/recordings/transcript-viewer"
import { formatDetailedTime } from "@/utils/format-time"

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function RecordingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recording, setRecording] = useState<any>(null)

  useEffect(() => {
    // Check if the ID is "review" and redirect if needed
    if (params.id === "review") {
      router.push("/recording/review")
      return
    }

    // Check if the ID is a valid UUID
    if (!isValidUUID(params.id)) {
      setError("Invalid recording ID")
      setLoading(false)
      return
    }

    async function fetchRecording() {
      try {
        setLoading(true)
        const result = await getRecording(params.id)

        if (result.success) {
          setRecording(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError("Failed to load recording details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecording()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black p-5">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-[#1C1C1E] mr-3" aria-label="Go back">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Loading...</h1>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-white animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !recording) {
    return (
      <div className="flex flex-col min-h-screen bg-black p-5">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-[#1C1C1E] mr-3" aria-label="Go back">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Error</h1>
        </div>
        <div className="p-4 bg-[#2C1215] border border-[#5C2327] rounded-lg flex items-start">
          <AlertCircle size={20} className="text-[#FF3B30] mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-[#FF3B30]">{error || "Recording not found"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black p-5">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-[#1C1C1E] mr-3" aria-label="Go back">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Recording Details</h1>
      </div>

      {/* Recording info */}
      <div className="bg-[#111111] rounded-xl p-4 mb-6">
        <h2 className="text-lg font-medium text-white mb-2">
          {recording.title || `Recording ${formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}`}
        </h2>
        <div className="flex flex-wrap gap-y-2">
          <div className="flex items-center mr-4">
            <div className="w-2 h-2 rounded-full bg-[#34C759] mr-1"></div>
            <span className="text-sm text-[#888888] capitalize">{recording.status}</span>
          </div>
          <div className="flex items-center mr-4">
            <Headphones size={14} className="text-[#888888] mr-1" />
            <span className="text-sm text-[#888888]">{formatDetailedTime(recording.duration)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-[#888888]">
              {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Audio player if available */}
      {recording.audio_url && (
        <div className="bg-[#111111] rounded-xl p-4 mb-6">
          <h3 className="text-white font-medium mb-3">Audio</h3>
          <audio controls className="w-full" src={recording.audio_url}>
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Transcript */}
      <TranscriptViewer transcript={recording.transcript} />

      {/* Posts button */}
      <div className="mt-6">
        <button
          onClick={() => router.push(`/posts?recording=${recording.id}`)}
          className="w-full py-4 bg-[#1C1C1E] text-white rounded-xl font-medium"
        >
          View Generated Posts
        </button>
      </div>
    </div>
  )
}
