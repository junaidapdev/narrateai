"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, X, Plus, Check, Eye, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { getSupabaseBrowser } from "@/lib/supabase"

export default function PostEditorPage({ params }: { params: { id: string } }) {
  const postId = params.id

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [newHashtag, setNewHashtag] = useState("")
  const [showHashtagInput, setShowHashtagInput] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const hashtagInputRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Character limits
  const maxContentChars = 3000

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        const supabase = getSupabaseBrowser()

        // Get the post
        const { data, error } = await supabase.from("posts").select("*").eq("id", postId).single()

        if (error) {
          console.error("Error fetching post:", error)
          setError("Failed to load post")
          return
        }

        // Use content field directly if available
        if (data.content) {
          setContent(data.content)
        }

        // If hook, body, and call_to_action exist, combine them
        if (data.hook || data.body || data.call_to_action) {
          const combinedContent = [data.hook, data.body, data.call_to_action].filter(Boolean).join("\n\n")

          if (combinedContent) {
            setContent(combinedContent)
          }
        }

        if (data.hashtags && Array.isArray(data.hashtags)) {
          setHashtags(data.hashtags)
        } else {
          // Try to extract hashtags from content as fallback
          const hashtagRegex = /#(\w+)/g
          const matches = (data.content || "").match(hashtagRegex)
          if (matches) {
            setHashtags(matches.map((tag) => tag.substring(1)))
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err)
        setError("An error occurred while loading the post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  // Auto-resize textareas
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  useEffect(() => {
    if (contentRef.current) autoResizeTextarea(contentRef.current)
  }, [content])

  // Focus hashtag input when shown
  useEffect(() => {
    if (showHashtagInput && hashtagInputRef.current) {
      hashtagInputRef.current.focus()
    }
  }, [showHashtagInput])

  // Handle adding new hashtag
  const handleAddHashtag = () => {
    if (newHashtag.trim() !== "") {
      setHashtags([...hashtags, newHashtag.trim().replace(/\s+/g, "")])
      setNewHashtag("")
      setShowHashtagInput(false)
    }
  }

  // Handle removing hashtag
  const handleRemoveHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index))
  }

  // Handle key press in hashtag input
  const handleHashtagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddHashtag()
    } else if (e.key === "Escape") {
      setShowHashtagInput(false)
      setNewHashtag("")
    }
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    const hashtagsText = hashtags.map((tag) => `#${tag}`).join(" ")
    const fullText = `${content}\n\n${hashtagsText}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = getSupabaseBrowser()

      // Only update the content field, not hashtags
      const { error } = await supabase
        .from("posts")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)

      if (error) {
        console.error("Error updating post:", error)
        setError(`Failed to save: ${error.message}`)
        setSaving(false)
        return
      }

      // Navigate back after successful save
      window.history.back()
    } catch (err) {
      console.error("Error saving post:", err)
      setError("An error occurred while saving")
      setSaving(false)
    }
  }

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-black items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        <p className="text-white mt-4">Loading post...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-20 backdrop-blur-md bg-black/80 border-b border-[#222222] px-5 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <Link href="/posts" className="flex items-center text-white">
            <ArrowLeft size={16} className="mr-1" />
            <span className="text-base">Back</span>
          </Link>
          <button
            className="text-white text-base flex items-center bg-[#1C1C1E] px-3 py-1.5 rounded-lg"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="mr-1.5">Saving...</span>
                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                <span className="mr-1.5">Save</span>
                <Check size={14} />
              </>
            )}
          </button>
        </div>
      </motion.header>

      {/* Error message */}
      {error && (
        <div className="mx-5 mt-4 p-3 bg-[#2C1215] border border-[#5C2327] rounded-lg">
          <p className="text-[#FF3B30] text-sm">{error}</p>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {/* Title section */}
        <motion.div
          className="mt-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <h1 className="text-xl font-semibold text-white">Edit Post</h1>
          <p className="text-sm text-[#888888] mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* Text editor area */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {/* Content section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-white">Content</label>
              <span
                className={`text-xs ${content.length > maxContentChars * 0.9 ? "text-[#FF3B30]" : "text-[#888888]"}`}
              >
                {content.length}/{maxContentChars}
              </span>
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= maxContentChars) {
                  setContent(e.target.value)
                  autoResizeTextarea(e.target)
                }
              }}
              className="w-full bg-transparent text-white text-base leading-relaxed p-3 rounded-lg border border-[#333333] focus:outline-none focus:border-white resize-none min-h-[200px]"
              placeholder="Write your post content here..."
              maxLength={maxContentChars}
              onInput={(e) => autoResizeTextarea(e.target as HTMLTextAreaElement)}
            />
          </div>

          {/* Hashtags section */}
          <div className="mt-2">
            <label className="text-sm font-medium text-white block mb-2">Hashtags</label>
            <div className="flex flex-wrap items-center gap-2 max-w-full pb-2 min-h-[40px] border border-[#333333] rounded-lg p-2">
              {hashtags.map((tag, index) => (
                <div key={index} className="flex items-center bg-[#1C1C1E] text-white text-sm rounded-full px-3 py-1">
                  <span>#{tag}</span>
                  <button className="ml-2 text-[#888888] hover:text-white" onClick={() => handleRemoveHashtag(index)}>
                    <X size={14} />
                  </button>
                </div>
              ))}

              {showHashtagInput ? (
                <div className="flex items-center">
                  <input
                    ref={hashtagInputRef}
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyDown={handleHashtagKeyPress}
                    onBlur={handleAddHashtag}
                    className="bg-transparent text-white text-sm focus:outline-none w-32"
                    placeholder="New hashtag"
                  />
                </div>
              ) : (
                <button
                  className="flex items-center text-[#888888] hover:text-white"
                  onClick={() => setShowHashtagInput(true)}
                >
                  <Plus size={14} className="mr-1" />
                  <span className="text-sm">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Preview section */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <button
              onClick={togglePreview}
              className="flex items-center justify-between w-full py-3 px-4 bg-transparent border border-[#333333] rounded-lg text-white mb-3 hover:bg-[#1C1C1E] transition-colors"
            >
              <div className="flex items-center">
                <Eye size={16} className="mr-2" />
                <span className="text-sm font-medium">LinkedIn Preview</span>
              </div>
              {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showPreview && (
              <motion.div
                className="bg-[#111111] rounded-lg p-4 border border-[#333333]"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {/* LinkedIn-style header */}
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">AJ</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Alex Johnson</p>
                    <p className="text-[#888888] text-xs">Content Creator • 2nd</p>
                  </div>
                </div>

                {/* Post content */}
                <div className="text-white text-sm leading-relaxed mb-3">
                  {content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Hashtags */}
                <div className="text-[#0077B5] text-sm mb-3">{hashtags.map((tag) => `#${tag}`).join(" ")}</div>

                {/* Engagement bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-[#222222]"></div>
                      <span className="text-[#888888] text-xs ml-1">Like</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-[#222222]"></div>
                      <span className="text-[#888888] text-xs ml-1">Comment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-[#222222]"></div>
                      <span className="text-[#888888] text-xs ml-1">Share</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-5 backdrop-blur-md bg-black/80 border-t border-[#222222]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <button
          className="w-full h-12 bg-[#1C1C1E] text-white rounded-xl font-medium active:opacity-90 transition-opacity flex items-center justify-center"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={16} className="mr-2" />
              Copied to Clipboard
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy to Clipboard
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}
