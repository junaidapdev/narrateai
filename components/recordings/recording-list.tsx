"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getUserRecordings } from "@/actions/recordings"
import type { Recording } from "@/types/database"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"

export default function RecordingList() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecordings() {
      try {
        setLoading(true)
        const result = await getUserRecordings()

        if (result.success) {
          setRecordings(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError("Failed to load recordings")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecordings()
  }, [])

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Get status icon based on recording status
  const getStatusIcon = (status: Recording["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} className="text-[#34C759] mr-1" />
      case "failed":
        return <AlertCircle size={14} className="text-[#FF3B30] mr-1" />
      case "processing":
      case "transcribing":
      case "generating":
        return <Loader2 size={14} className="text-white animate-spin mr-1" />
      default:
        return <Clock size={14} className="text-[#888888] mr-1" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 size={24} className="text-white animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#FF3B30]">{error}</p>
      </div>
    )
  }

  if (recordings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#888888]">No recordings found. Start by creating a new recording.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <div key={recording.id} className="bg-[#111111] rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-base font-semibold text-white">
                {recording.title ||
                  `Recording ${formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}`}
              </h4>
              <div className="flex items-center mt-1">
                <span className="text-sm text-[#888888] mr-3">{formatDuration(recording.duration)}</span>
                <div className="flex items-center text-sm text-[#888888]">
                  {getStatusIcon(recording.status)}
                  <span className="capitalize">{recording.status}</span>
                </div>
              </div>
            </div>
            <Link href={`/recording/${recording.id}`}>
              <button className="border border-[#333333] text-white text-sm rounded-lg px-4 py-2">
                {recording.status === "completed" ? "View Details" : "View Status"}
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
