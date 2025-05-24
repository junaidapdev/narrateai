"use client"

import { useState } from "react"
import { Bug } from "lucide-react"

export function DebugButton() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const fetchDebugInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug-posts")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Error fetching debug info:", error)
      setDebugInfo({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => {
          setShowDebug(!showDebug)
          if (!debugInfo && !showDebug) {
            fetchDebugInfo()
          }
        }}
        className="fixed bottom-20 right-4 bg-[#333333] p-2 rounded-full z-50"
      >
        <Bug size={20} className="text-white" />
      </button>

      {showDebug && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-auto p-4">
          <div className="bg-[#1C1C1E] rounded-lg p-4 max-w-2xl mx-auto my-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-medium">Debug Information</h2>
              <button onClick={() => setShowDebug(false)} className="text-white">
                ✕
              </button>
            </div>

            {loading ? (
              <p className="text-[#888888]">Loading debug info...</p>
            ) : (
              <pre className="text-xs text-[#888888] overflow-auto max-h-[500px] p-2 bg-[#111111] rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={fetchDebugInfo} className="bg-[#333333] text-white px-4 py-2 rounded" disabled={loading}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
