"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserRecordings } from "@/services/recording-service"
import { generatePostFromRecording } from "@/actions/post-generation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mic, Loader2 } from "lucide-react"
import TabBar from "@/components/navigation/tab-bar"
import { useAuth } from "@/contexts/AuthContext"

export default function GeneratePostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [recordings, setRecordings] = useState<any[]>([])
  const [selectedRecording, setSelectedRecording] = useState<string>("")
  const [platform, setPlatform] = useState<string>("linkedin")
  const [loading, setLoading] = useState<boolean>(true)
  const [generating, setGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const result = await getUserRecordings()
        if (result.success) {
          // Only show recordings with transcripts
          const completedRecordings = result.data.filter((rec: any) => rec.transcript)
          setRecordings(completedRecordings)
        } else {
          setError(result.error || "Failed to fetch recordings")
        }
      } catch (err) {
        console.error("Error fetching recordings:", err)
        setError("An error occurred while fetching recordings")
      } finally {
        setLoading(false)
      }
    }

    fetchRecordings()
  }, [])

  const handleGenerate = async () => {
    if (!selectedRecording || !user?.id) return

    setGenerating(true)
    setError(null)

    try {
      const result = await generatePostFromRecording({
        recordingId: selectedRecording,
        userId: user.id,
        platform,
      })

      if (result.success) {
        router.push("/posts")
      } else {
        setError(result.error || "Failed to generate post")
      }
    } catch (err) {
      console.error("Error generating post:", err)
      setError("An error occurred while generating the post")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="px-5 py-3">
        <h1 className="text-2xl font-bold text-white">Generate Post</h1>
      </header>

      <div className="flex-1 px-5 py-3">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Create from Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="h-12 w-12 mx-auto text-zinc-500 mb-3" />
                <p className="text-zinc-400">No recordings with transcripts found</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                  onClick={() => router.push("/recording")}
                >
                  Create Recording
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="recording" className="text-zinc-300">
                    Select Recording
                  </Label>
                  <Select value={selectedRecording} onValueChange={setSelectedRecording}>
                    <SelectTrigger
                      id="recording"
                      className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-700"
                    >
                      <SelectValue placeholder="Select a recording" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {recordings.map((recording) => (
                        <SelectItem key={recording.id} value={recording.id}>
                          {recording.title || `Recording ${new Date(recording.created_at).toLocaleDateString()}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-zinc-300">
                    Platform
                  </Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="bg-zinc-800 border-zinc-700 text-white focus:ring-zinc-700">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-white text-black hover:bg-zinc-200"
              onClick={handleGenerate}
              disabled={!selectedRecording || generating || loading}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Post"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <TabBar activeTab="posts" />
      <div className="pb-20"></div>
    </div>
  )
}
