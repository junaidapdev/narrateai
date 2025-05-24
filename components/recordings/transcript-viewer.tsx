"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TranscriptViewerProps {
  transcript: string
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="bg-[#1C1C1E] border-[#333333] text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Transcript</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-[#888888] flex items-center">
            <img src="/placeholder-gn5bn.png" alt="AssemblyAI" className="h-5 w-5 mr-1" />
            Powered by AssemblyAI
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 border-[#333333] hover:bg-[#333333]"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto pr-2 text-[#DDDDDD]">
          {transcript.split("\n").map((paragraph, index) => (
            <p key={index} className={`${paragraph.trim() === "" ? "h-4" : "mb-4"}`}>
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TranscriptViewer
