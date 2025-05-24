"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Play, Edit, Copy, Check, Plus } from "lucide-react"
import { getUserPosts, updatePostStatus } from "@/services/post-service"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { Post } from "@/types/database"
import TabBar from "@/components/navigation/tab-bar"

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"generated" | "posted">("generated")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const result = await getUserPosts()

      if (result.success) {
        setPosts(result.data)
      } else {
        setError(result.error || "Failed to fetch posts")
      }
    } catch (err) {
      console.error("Exception in fetchPosts:", err)
      setError("An error occurred while fetching posts")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPosted = async (postId: string) => {
    try {
      setActionLoading(postId)
      const result = await updatePostStatus(postId, "posted")

      if (result.success) {
        await fetchPosts()
      } else {
        console.error("Error updating post status:", result.error)
      }
    } catch (error) {
      console.error("Error marking post as posted:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "generated") return post.status !== "posted"
    return post.status === "posted"
  })

  // Group posts by date
  const groupedPosts: Record<string, Post[]> = {}

  filteredPosts.forEach((post) => {
    const date = new Date(post.created_at || Date.now())
    const dateKey = format(date, "yyyy-MM-dd")
    const today = format(new Date(), "yyyy-MM-dd")
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd")

    let displayDate
    if (dateKey === today) displayDate = "TODAY"
    else if (dateKey === yesterday) displayDate = "YESTERDAY"
    else displayDate = format(date, "MMMM d")

    if (!groupedPosts[displayDate]) {
      groupedPosts[displayDate] = []
    }

    groupedPosts[displayDate].push(post)
  })

  // Sort dates to ensure TODAY comes first
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => {
    if (a === "TODAY") return -1
    if (b === "TODAY") return 1
    if (a === "YESTERDAY") return -1
    if (b === "YESTERDAY") return 1
    return 0
  })

  // Helper function to get post title
  const getPostTitle = (post: Post) => {
    if (post.hook) {
      // Use the hook as the title if available
      return post.hook
    } else if (post.content) {
      // Otherwise use the first line of content
      const firstLine = post.content.split("\n")[0]
      // Limit to a reasonable length for a title
      return firstLine.length > 60 ? `${firstLine.substring(0, 60)}...` : firstLine
    }
    return "Untitled Post"
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="px-5 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Posts</h1>
        <button
          onClick={() => router.push("/posts/generate")}
          className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center"
          aria-label="Create new post"
        >
          <Plus size={20} className="text-white" />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-5 border-b border-zinc-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab("generated")}
            className={cn(
              "py-2 px-1 relative font-medium text-base",
              activeTab === "generated" ? "text-white" : "text-zinc-500",
            )}
          >
            Generated
            {activeTab === "generated" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>}
          </button>
          <button
            onClick={() => setActiveTab("posted")}
            className={cn(
              "py-2 px-1 ml-6 relative font-medium text-base",
              activeTab === "posted" ? "text-white" : "text-zinc-500",
            )}
          >
            Posted
            {activeTab === "posted" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 py-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-zinc-900 rounded-lg p-3 mt-3">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchPosts} className="mt-2 text-xs text-white bg-zinc-800 px-2 py-1 rounded">
              Retry
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-zinc-500 text-sm">No posts found</p>
            <button
              onClick={() => router.push("/posts/generate")}
              className="mt-3 text-white text-xs bg-zinc-800 px-3 py-1.5 rounded-full flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Create Post
            </button>
          </div>
        ) : (
          <>
            {sortedDates.map((date) => (
              <div key={date} className="mb-4">
                <h2 className="text-zinc-500 text-xs font-medium mb-2">{date}</h2>
                <div className="space-y-3">
                  {groupedPosts[date].map((post) => (
                    <div key={post.id} className="bg-zinc-900 rounded-lg p-3">
                      <h3 className="text-white text-base font-medium mb-1.5">{getPostTitle(post)}</h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                        {post.body
                          ? post.body.substring(0, 100) + (post.body.length > 100 ? "..." : "")
                          : post.content
                            ? post.content.split("\n").slice(1).join(" ").substring(0, 100) +
                              (post.content.split("\n").slice(1).join(" ").length > 100 ? "..." : "")
                            : "No content"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                          {post.recording_id && (
                            <button
                              className="flex items-center text-zinc-400 text-xs"
                              onClick={() => router.push(`/recording/${post.recording_id}`)}
                            >
                              <Play size={14} />
                              <span className="ml-1">Play</span>
                            </button>
                          )}
                          <button
                            className="flex items-center text-zinc-400 text-xs"
                            onClick={() => router.push(`/posts/${post.id}/edit`)}
                          >
                            <Edit size={14} />
                            <span className="ml-1">Edit</span>
                          </button>
                          <button
                            className="flex items-center text-zinc-400 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(post.content || "")
                              alert("Copied to clipboard")
                            }}
                          >
                            <Copy size={14} />
                            <span className="ml-1">Copy</span>
                          </button>
                        </div>
                        {post.status !== "posted" && (
                          <button
                            className="flex items-center text-zinc-400 text-xs"
                            onClick={() => handleMarkAsPosted(post.id)}
                            disabled={actionLoading === post.id}
                          >
                            {actionLoading === post.id ? (
                              <span className="w-3 h-3 border-2 border-t-transparent border-zinc-400 rounded-full animate-spin mr-1"></span>
                            ) : (
                              <Check size={14} className="mr-1" />
                            )}
                            <span>Mark as Posted</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {/* Tab Bar */}
      <TabBar activeTab="posts" />

      {/* Add padding at the bottom to account for the tab bar */}
      <div className="pb-20"></div>
    </div>
  )
}
