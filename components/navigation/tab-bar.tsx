"use client"

import Link from "next/link"
import { Home, Mic, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type TabBarProps = {
  activeTab: "home" | "recording" | "posts"
}

export default function TabBar({ activeTab }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-900 py-2.5 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Link href="/dashboard" className="flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                activeTab === "home" ? "bg-zinc-800" : "bg-transparent",
              )}
            >
              <Home
                size={18}
                className={cn("transition-colors", activeTab === "home" ? "text-white" : "text-zinc-500")}
                strokeWidth={1.5}
              />
            </div>
            <span
              className={cn("text-[10px] mt-0.5 font-medium", activeTab === "home" ? "text-white" : "text-zinc-500")}
            >
              Home
            </span>
          </div>
        </Link>

        <Link href="/recording" className="flex-1">
          <div className="flex flex-col items-center -mt-5">
            <div className="bg-zinc-800 w-14 h-14 rounded-full flex items-center justify-center border-4 border-black shadow-lg">
              <Mic size={20} className="text-white" strokeWidth={1.5} />
            </div>
            <span
              className={cn(
                "text-[10px] mt-0.5 font-medium",
                activeTab === "recording" ? "text-white" : "text-zinc-500",
              )}
            >
              Record
            </span>
          </div>
        </Link>

        <Link href="/posts" className="flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                activeTab === "posts" ? "bg-zinc-800" : "bg-transparent",
              )}
            >
              <FileText
                size={18}
                className={cn("transition-colors", activeTab === "posts" ? "text-white" : "text-zinc-500")}
                strokeWidth={1.5}
              />
            </div>
            <span
              className={cn("text-[10px] mt-0.5 font-medium", activeTab === "posts" ? "text-white" : "text-zinc-500")}
            >
              Posts
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}
