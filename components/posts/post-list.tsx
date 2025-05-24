"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Edit, Trash, Copy, Share, Clock, CheckCircle } from "lucide-react"
import { updatePostStatus, deletePost } from "@/services/post-service"
import type { Post } from "@/types/database"

interface PostListProps {
  posts: Post[]
  onRefresh: () => void
}

export function PostList({ posts, onRefresh }: PostListProps) {
  const router = useRouter()
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const toggleExpand = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId)
  }

  const handleEdit = (postId: string) => {
    router.push(`/posts/${postId}/edit`)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      setActionLoading(postId)
      const result = await deletePost(postId)

      if (result.success) {
        onRefresh()
      } else {
        alert(`Failed to delete post: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("An error occurred while deleting the post")
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusChange = async (postId: string, status: Post["status"]) => {
    try {
      setActionLoading(postId)
      const result = await updatePostStatus(postId, status)

      if (result.success) {
        onRefresh()
      } else {
        alert(`Failed to update post status: ${result.error}`)
      }
    } catch (error) {
      console.error("Error updating post status:", error)
      alert("An error occurred while updating the post status")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => alert("Post copied to clipboard"))
      .catch((err) => {
        console.error("Failed to copy:", err)
        alert("Failed to copy post to clipboard")
      })
  }

  const formatContent = (content: string) => {
    if (!content) return <p className="text-gray-500">No content</p>

    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className={index === 0 ? "font-medium" : ""}>
        {paragraph}
      </p>
    ))
  }

  const getPlatformLabel = (platform: string | null) => {
    switch (platform) {
      case "linkedin":
        return "LinkedIn"
      case "twitter":
        return "Twitter"
      case "facebook":
        return "Facebook"
      default:
        return platform || "Unknown"
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "draft":
        return "Draft"
      case "scheduled":
        return "Scheduled"
      case "posted":
        return "Posted"
      default:
        return status || "Draft"
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "draft":
        return "bg-[#333333] text-white"
      case "scheduled":
        return "bg-[#5856D6] text-white"
      case "posted":
        return "bg-[#34C759] text-white"
      default:
        return "bg-[#333333] text-white"
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-[#1C1C1E] p-6 rounded-xl mb-6">
          <div className="w-12 h-12 bg-[#333333] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-[#888888] text-xl">?</span>
          </div>
          <h2 className="text-white text-lg font-medium mb-2">No posts yet</h2>
          <p className="text-[#888888] mb-6">
            Record audio and generate your first post, or create a post from scratch.
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => router.push("/recording")}
              className="w-full py-3 bg-white text-black rounded-lg font-medium"
            >
              Record Audio
            </button>
            <button
              onClick={() => router.push("/posts/generate")}
              className="w-full py-3 bg-[#1C1C1E] text-white border border-[#333333] rounded-lg font-medium"
            >
              Create Post
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className={`bg-[#1C1C1E] rounded-xl overflow-hidden ${
            post.recording_id ? "border-l-4 border-[#5856D6]" : ""
          }`}
        >
          {/* Post header */}
          <div className="p-4 flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(post.status)}`}>
                  {getStatusLabel(post.status)}
                </span>
                <span className="text-xs text-[#888888]">{getPlatformLabel(post.platform)}</span>
                {post.recording_id && (
                  <span className="text-xs text-[#5856D6] flex items-center">
                    <span className="w-2 h-2 bg-[#5856D6] rounded-full mr-1"></span>
                    From Recording
                  </span>
                )}
              </div>
              <p className="text-xs text-[#888888]">
                {new Date(post.created_at || Date.now()).toLocaleDateString()} at{" "}
                {new Date(post.created_at || Date.now()).toLocaleTimeString()}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => toggleExpand(post.id)}
                className="p-2 text-[#888888] hover:text-white transition-colors rounded-full"
                aria-label="Post options"
              >
                <MoreHorizontal size={20} />
              </button>
              {expandedPost === post.id && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2C2C2E] rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => handleEdit(post.id)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A3C] flex items-center"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleCopy(post.content || "")}
                    className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A3C] flex items-center"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy
                  </button>
                  {post.status === "draft" && (
                    <button
                      onClick={() => handleStatusChange(post.id, "posted")}
                      className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A3C] flex items-center"
                      disabled={actionLoading === post.id}
                    >
                      {actionLoading === post.id ? (
                        <span className="mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      ) : (
                        <Share size={16} className="mr-2" />
                      )}
                      Mark as Posted
                    </button>
                  )}
                  {post.status === "posted" && (
                    <button
                      onClick={() => handleStatusChange(post.id, "draft")}
                      className="w-full px-4 py-2 text-left text-white hover:bg-[#3A3A3C] flex items-center"
                      disabled={actionLoading === post.id}
                    >
                      {actionLoading === post.id ? (
                        <span className="mr-2 w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      ) : (
                        <Clock size={16} className="mr-2" />
                      )}
                      Mark as Draft
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-full px-4 py-2 text-left text-[#FF3B30] hover:bg-[#3A3A3C] flex items-center"
                    disabled={actionLoading === post.id}
                  >
                    {actionLoading === post.id ? (
                      <span className="mr-2 w-4 h-4 border-2 border-t-transparent border-[#FF3B30] rounded-full animate-spin"></span>
                    ) : (
                      <Trash size={16} className="mr-2" />
                    )}
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post content */}
          <div className="px-4 pb-4">
            <div className="space-y-2 text-white">{formatContent(post.content || "")}</div>
          </div>

          {/* Post footer */}
          <div className="px-4 pb-4 flex justify-between">
            <div className="flex space-x-2">
              {post.status === "posted" && (
                <div className="flex items-center text-xs text-[#34C759]">
                  <CheckCircle size={12} className="mr-1" />
                  Posted
                </div>
              )}
            </div>
            <button
              onClick={() => handleEdit(post.id)}
              className="text-xs text-[#5856D6] hover:text-[#7674D9] transition-colors"
            >
              Edit Post
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
