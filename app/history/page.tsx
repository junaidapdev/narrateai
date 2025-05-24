"use client"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import TabBar from "@/components/navigation/tab-bar"

export default function HistoryPage() {
  // Sample data for recordings history
  const recordings = [
    {
      id: 1,
      date: "May 12, 2025",
      duration: "28:45",
      status: "completed",
      postsGenerated: 7,
    },
    {
      id: 2,
      date: "May 8, 2025",
      duration: "15:20",
      status: "completed",
      postsGenerated: 4,
    },
    {
      id: 3,
      date: "May 3, 2025",
      duration: "32:10",
      status: "completed",
      postsGenerated: 8,
    },
    {
      id: 4,
      date: "April 29, 2025",
      duration: "18:55",
      status: "completed",
      postsGenerated: 5,
    },
    {
      id: 5,
      date: "April 22, 2025",
      duration: "41:30",
      status: "completed",
      postsGenerated: 10,
    },
    {
      id: 6,
      date: "April 15, 2025",
      duration: "22:15",
      status: "completed",
      postsGenerated: 6,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 pb-20">
      {/* Header */}
      <header className="flex justify-between items-center pt-12 pb-6">
        <h1 className="text-2xl font-semibold text-white">History</h1>
      </header>

      {/* Recordings list */}
      <div className="mt-4">
        <div className="space-y-4">
          {recordings.map((recording) => (
            <div key={recording.id} className="py-4 border-b border-[#222222]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-base font-semibold text-white">{recording.date}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-[#888888] mr-3">{recording.duration}</span>
                    <div className="flex items-center text-sm text-[#888888]">
                      <CheckCircle size={14} className="text-[#34C759] mr-1" />
                      <span>Completed</span>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-[#888888]">{recording.postsGenerated} posts generated</div>
                </div>
                <Link href={`/posts?recording=${recording.id}`}>
                  <button className="border border-[#333333] text-white text-sm rounded-lg px-4 py-2">
                    View Posts
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar activeTab="history" />
    </div>
  )
}
