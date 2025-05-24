"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Share, Copy } from "lucide-react"

export default function PostsListScreen() {
  // Sample data for posts
  const posts = [
    {
      id: 1,
      day: "Monday",
      content:
        "Just wrapped up a fascinating discussion on AI-driven content creation. The potential to transform how we communicate ideas is immense, but the human touch remains irreplaceable. What's your take on AI in content creation?",
      hashtags: "#AIContent #DigitalTransformation #FutureOfWork",
      charCount: 234,
    },
    {
      id: 2,
      day: "Tuesday",
      content:
        "Three key insights from yesterday's leadership meeting:\n\n1. Customer feedback should drive product iterations\n2. Cross-functional collaboration breaks down silos\n3. Data-informed decisions outperform gut instincts\n\nWhich of these resonates most with your experience?",
      hashtags: "#Leadership #ProductDevelopment #DataDriven",
      charCount: 278,
    },
    {
      id: 3,
      day: "Wednesday",
      content:
        "The most underrated skill in business today? Active listening. It's not just about hearing words, but understanding context, emotion, and unspoken needs. I've found that my best client relationships developed when I focused less on selling and more on truly listening.",
      hashtags: "#BusinessSkills #ClientRelations #Communication",
      charCount: 256,
    },
    {
      id: 4,
      day: "Thursday",
      content:
        "Productivity hack that changed my workflow: the 90-minute focus block. No notifications, no meetings, just deep work on one priority task. I've doubled my output on complex projects since implementing this approach. What's your go-to productivity technique?",
      hashtags: "#Productivity #DeepWork #TimeManagement",
      charCount: 245,
    },
    {
      id: 5,
      day: "Friday",
      content:
        "Celebrating a milestone today: our team just launched a feature that's been six months in the making. The journey had its challenges, but seeing users' positive reactions makes it all worthwhile. Grateful for a team that persists through obstacles.",
      hashtags: "#TeamSuccess #ProductLaunch #Gratitude",
      charCount: 232,
    },
    {
      id: 6,
      day: "Saturday",
      content:
        "Weekend reflection: Growth happens at the edge of comfort. This week pushed me into new territory with public speaking, and while it wasn't perfect, I'm better for having embraced the challenge. What uncomfortable growth are you pursuing?",
      hashtags: "#PersonalGrowth #WeekendThoughts #Reflection",
      charCount: 219,
    },
    {
      id: 7,
      day: "Sunday",
      content:
        "Sunday reading recommendation: 'Atomic Habits' by James Clear. The concept that tiny changes compound into remarkable results applies to both business and personal development. What book has influenced your approach recently?",
      hashtags: "#BookRecommendation #AtomicHabits #SundayReading",
      charCount: 210,
    },
  ]

  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Handle copy for individual post
  const handleCopy = (id: number, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle copy all posts
  const handleCopyAll = () => {
    const allContent = posts.map((post) => `${post.day}:\n${post.content}\n${post.hashtags}`).join("\n\n")
    navigator.clipboard.writeText(allContent)
    alert("All posts copied to clipboard")
  }

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/processing" className="flex items-center text-white">
          <ArrowLeft size={16} className="mr-1" />
          <span className="text-base">Back</span>
        </Link>
        <button className="text-white text-base flex items-center" onClick={handleCopyAll}>
          <span className="mr-1">Copy All</span>
          <span>⊐</span>
        </button>
      </div>

      {/* Title section */}
      <div className="text-center mt-6 mb-8">
        <h1 className="text-2xl font-semibold text-white">Your 7 Posts</h1>
        <p className="text-sm text-[#888888] mt-1">May 11, 2025</p>
      </div>

      {/* Posts list */}
      <div className="flex-1 overflow-y-auto">
        {posts.map((post) => (
          <div key={post.id} className="mb-6 pb-6">
            <h2 className="text-base font-semibold text-white mb-2">{post.day}</h2>
            <div className="h-px bg-[#222222] mb-4"></div>

            <p className="text-white text-base mb-2 whitespace-pre-line">{post.content}</p>
            <p className="text-sm text-[#888888] mb-4">{post.hashtags}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">{post.charCount} characters</span>
              <div className="flex items-center space-x-3">
                <button
                  className="px-3 py-1 border border-[#333333] rounded-md text-white text-sm flex items-center active:opacity-70 transition-opacity"
                  onClick={() => handleCopy(post.id, `${post.content}\n${post.hashtags}`)}
                >
                  {copiedId === post.id ? "Copied!" : "Copy"}
                  <Copy size={14} className="ml-1" />
                </button>
                <button className="text-white active:opacity-70 transition-opacity">
                  <Share size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
