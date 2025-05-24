"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Play, Edit, Send, Home, Mic, FileText } from "lucide-react"
import { getUserRecordings } from "@/services/recording-service"
import { getUserPosts } from "@/services/post-service"
import type { Recording, Post } from "@/types/database"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch recordings
        const recordingsResult = await getUserRecordings()
        if (recordingsResult.success) {
          setRecordings(recordingsResult.data || [])
        } else {
          console.error("Error fetching recordings:", recordingsResult.error)
          setError(recordingsResult.error || "Failed to fetch recordings")
        }

        // Fetch posts
        const postsResult = await getUserPosts()
        if (postsResult.success) {
          setPosts(postsResult.data || [])
        } else {
          console.error("Error fetching posts:", postsResult.error)
          setError(postsResult.error || "Failed to fetch posts")
        }
      } catch (err) {
        console.error("Error in fetchData:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate total recording duration in minutes
  const totalRecordingMinutes =
    recordings.reduce((total, recording) => {
      return total + (recording.duration || 0)
    }, 0) / 60

  // Get published posts count
  const publishedPostsCount = posts.filter((post) => post.status === "published" || post.status === "posted").length

  // Get draft posts that are ready to publish
  const draftPosts = posts.filter((post) => post.status === "draft")

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(1, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mb-3"></div>
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 text-sm mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 pb-20">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">AudioBrand</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="flex items-center text-zinc-400 text-xs mb-1">
              <FileText size={12} className="mr-1" />
              <span>Posts</span>
            </div>
            <p className="text-2xl font-bold">{posts.length}</p>
          </div>

          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="flex items-center text-zinc-400 text-xs mb-1">
              <Send size={12} className="mr-1" />
              <span>Published</span>
            </div>
            <p className="text-2xl font-bold">{publishedPostsCount}</p>
          </div>

          <div className="bg-zinc-900 rounded-lg p-3">
            <div className="flex items-center text-zinc-400 text-xs mb-1">
              <Mic size={12} className="mr-1" />
              <span>Recording</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(totalRecordingMinutes)} min</p>
          </div>
        </div>

        {/* Ready to Publish */}
        {draftPosts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Ready to Publish</h2>

            <div className="bg-zinc-900 rounded-lg p-3">
              <h3 className="text-base font-medium mb-3">
                {draftPosts[0].hook || draftPosts[0].content?.substring(0, 60) + "..."}
              </h3>

              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/posts/${draftPosts[0].id}/edit`)}
                  className="flex items-center justify-center px-3 py-1.5 bg-zinc-800 rounded-lg text-xs"
                >
                  <Edit size={14} className="mr-1" />
                  Edit
                </button>

                <button
                  onClick={() => router.push(`/posts/${draftPosts[0].id}/publish`)}
                  className="flex items-center justify-center px-3 py-1.5 bg-zinc-800 rounded-lg text-xs"
                >
                  <Send size={14} className="mr-1" />
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">Recent Activity</h2>

          {/* Recent Recordings */}
          {recordings.length > 0 &&
            recordings.slice(0, 3).map((recording) => (
              <div key={recording.id} className="bg-zinc-900 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center">
                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full text-[10px]">
                      Recording
                    </span>
                    <span className="text-zinc-400 text-[10px] ml-1.5">
                      {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="text-zinc-400 text-[10px]">{formatDuration(recording.duration)}</span>
                </div>

                <h3 className="text-base font-medium mb-2.5">{recording.title || "New Recording"}</h3>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/recording/${recording.id}`)}
                    className="flex items-center justify-center px-3 py-1.5 bg-zinc-800 rounded-lg text-xs"
                  >
                    <Play size={14} className="mr-1" />
                    Play
                  </button>

                  <button
                    onClick={() => router.push(`/posts/generate?recordingId=${recording.id}`)}
                    className="flex items-center justify-center px-3 py-1.5 bg-zinc-800 rounded-lg text-xs"
                  >
                    <Send size={14} className="mr-1" />
                    Create Post
                  </button>
                </div>
              </div>
            ))}

          {/* Recent Posts */}
          {posts.length > 0 &&
            posts.slice(0, 3).map((post) => (
              <div key={post.id} className="bg-zinc-900 rounded-lg p-3 mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center">
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-full">Post</span>
                    <span className="text-zinc-400 text-[10px] ml-1.5">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="bg-blue-900 text-blue-400 text-[10px] px-2 py-0.5 rounded-full">
                    {post.platform?.charAt(0).toUpperCase() + post.platform?.slice(1) || "LinkedIn"}
                  </span>
                </div>

                <h3 className="text-base font-medium mb-2.5">{post.hook || post.content?.substring(0, 60) + "..."}</h3>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/posts/${post.id}/edit`)}
                    className="flex items-center justify-center px-3 py-1.5 bg-zinc-800 rounded-lg text-xs"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))}

          {recordings.length === 0 && posts.length === 0 && (
            <div className="bg-zinc-900 rounded-lg p-4 text-center">
              <p className="text-zinc-400 text-sm mb-3">No recent activity</p>
              <button
                onClick={() => router.push("/recording")}
                className="px-3 py-1.5 bg-zinc-800 rounded-lg inline-flex items-center text-xs"
              >
                <Mic size={14} className="mr-1" />
                Start Recording
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
        <div className="flex justify-around items-center h-14">
          <Link href="/dashboard" className="flex flex-col items-center justify-center text-white">
            <Home size={18} />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          <Link href="/recording" className="relative">
            <div className="absolute -top-6 bg-zinc-800 rounded-full p-3 border-4 border-black">
              <Mic size={18} className="text-white" />
            </div>
            <span className="text-[10px] mt-9 block text-white">Record</span>
          </Link>

          <Link href="/posts" className="flex flex-col items-center justify-center text-white">
            <FileText size={18} />
            <span className="text-[10px] mt-0.5">Posts</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
