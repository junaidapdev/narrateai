"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, X, Plus, Check } from "lucide-react"

export default function PostEditorScreen() {
  // Sample initial post content
  const initialContent =
    "Just wrapped up a fascinating discussion on AI-driven content creation. The potential to transform how we communicate ideas is immense, but the human touch remains irreplaceable. What's your take on AI in content creation?"

  // Sample initial hashtags
  const initialHashtags = ["AIContent", "DigitalTransformation", "FutureOfWork"]

  const [content, setContent] = useState(initialContent)
  const [hashtags, setHashtags] = useState(initialHashtags)
  const [newHashtag, setNewHashtag] = useState("")
  const [showHashtagInput, setShowHashtagInput] = useState(false)
  const [copied, setCopied] = useState(false)
  const hashtagInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Character limit
  const maxChars = 3000

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
  const handleSave = () => {
    // In a real app, this would save the post to a database
    alert("Post saved successfully!")
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/posts" className="flex items-center text-white">
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-base">Back</span>
        </Link>
        <button className="text-white text-base flex items-center" onClick={handleSave}>
          <span className="mr-1">Save</span>
          <Check size={16} />
        </button>
      </div>

      {/* Title section */}
      <div className="text-center mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-white">Edit Post</h1>
        <p className="text-sm text-[#888888] mt-1">Monday, May 12</p>
      </div>

      {/* Text editor area */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent text-white text-base leading-relaxed p-5 border-b border-[#333333] focus:outline-none resize-none"
          style={{ minHeight: "200px" }}
          placeholder="Write your post here..."
          maxLength={maxChars}
        />

        {/* Character counter */}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-[#888888]">
            Characters: {content.length}/{maxChars}
          </span>
        </div>

        {/* Hashtags section */}
        <div className="mt-8">
          <p className="text-sm text-[#888888] mb-3">Hashtags:</p>

          <div className="flex flex-wrap items-center gap-2 max-w-full overflow-x-auto pb-2">
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
                  className="bg-transparent text-white text-sm border-b border-[#333333] focus:outline-none w-32"
                  placeholder="New hashtag"
                />
              </div>
            ) : (
              <button
                className="flex items-center text-[#888888] border border-dashed border-[#333333] rounded-full px-3 py-1"
                onClick={() => setShowHashtagInput(true)}
              >
                <Plus size={14} className="mr-1" />
                <span className="text-sm">Add hashtag</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Copy to Clipboard button */}
      <div className="mt-auto mb-5">
        <button
          className="w-full h-12 bg-[#1C1C1E] text-white rounded-xl font-semibold active:opacity-90 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
      </div>
    </div>
  )
}
