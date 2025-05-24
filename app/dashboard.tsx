"use client"
import { useState } from "react"
import { Mic, User, Home, Clock, CheckCircle } from "lucide-react"

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState("home")

  // Sample data for recent recordings
  const recentRecordings = [
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
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black px-5 pb-20">
      {/* Header */}
      <header className="flex justify-between items-center pt-12 pb-6">
        <h1 className="text-2xl font-semibold text-white">AudioBrand AI</h1>
        <button className="text-white">
          <User size={24} strokeWidth={1.5} />
        </button>
      </header>

      {/* Welcome section */}
      <div className="mt-6">
        <h2 className="text-lg text-white">Welcome, Alex!</h2>
      </div>

      {/* Primary action card */}
      <div
        className="bg-[#111111] rounded-2xl mt-6 flex flex-col items-center justify-center p-8 active:opacity-90 transition-opacity"
        role="button"
        tabIndex={0}
      >
        <Mic size={48} className="text-white mb-4" strokeWidth={1.5} />
        <span className="text-lg text-white">Start Recording</span>
      </div>

      {/* Recent Recordings section */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-white mb-4">Recent Recordings</h3>

        <div className="space-y-4">
          {recentRecordings.map((recording) => (
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
                </div>
                <button className="border border-[#333333] text-white text-sm rounded-lg px-4 py-2">View Posts</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#222222] py-4 px-6">
        <div className="flex justify-around items-center">
          <button
            className={`flex flex-col items-center ${activeTab === "home" ? "text-white" : "text-[#888888]"}`}
            onClick={() => setActiveTab("home")}
          >
            <Home size={20} strokeWidth={1.5} />
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            className={`flex flex-col items-center ${activeTab === "history" ? "text-white" : "text-[#888888]"}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={20} strokeWidth={1.5} />
            <span className="text-xs mt-1">History</span>
          </button>

          <button
            className={`flex flex-col items-center ${activeTab === "me" ? "text-white" : "text-[#888888]"}`}
            onClick={() => setActiveTab("me")}
          >
            <User size={20} strokeWidth={1.5} />
            <span className="text-xs mt-1">Me</span>
          </button>
        </div>
      </div>
    </div>
  )
}
