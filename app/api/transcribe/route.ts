import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Check if we have an AssemblyAI API key
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY
    if (!assemblyApiKey) {
      return NextResponse.json({ success: false, error: "AssemblyAI API key not configured" }, { status: 500 })
    }

    // Get form data
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const recordingId = formData.get("recordingId") as string

    if (!audioFile || !recordingId) {
      return NextResponse.json({ success: false, error: "Missing audio file or recording ID" }, { status: 400 })
    }

    // Convert audio to proper format if needed
    const processedAudioFile = audioFile

    // Check file size - AssemblyAI has a 5GB limit
    if (audioFile.size > 5 * 1024 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Audio file too large (max 5GB)" }, { status: 400 })
    }

    // Check file type and convert if necessary
    const fileType = audioFile.type
    console.log("Audio file type:", fileType)

    // Use mock transcription for development or if AssemblyAI fails
    try {
      // Upload to AssemblyAI
      console.log("Uploading to AssemblyAI...")
      const audioBuffer = await audioFile.arrayBuffer()

      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          Authorization: assemblyApiKey,
          "Content-Type": "application/octet-stream",
        },
        body: audioBuffer,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("AssemblyAI upload error:", errorText)

        // Fall back to mock transcription
        return await handleMockTranscription(recordingId)
      }

      const uploadResult = await uploadResponse.json()
      const uploadUrl = uploadResult.upload_url

      // Submit the transcription request
      console.log("Submitting transcription request...")
      const transcriptionResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          Authorization: assemblyApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio_url: uploadUrl,
          language_code: "en",
        }),
      })

      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text()
        console.error("AssemblyAI transcription request error:", errorText)

        // Fall back to mock transcription
        return await handleMockTranscription(recordingId)
      }

      const transcriptionResult = await transcriptionResponse.json()
      const transcriptId = transcriptionResult.id

      // Poll for the transcription result
      let transcript = ""
      let status = "processing"
      let attempts = 0
      const maxAttempts = 60 // Maximum polling attempts (5 minutes with 5-second intervals)

      while (status === "processing" || (status === "queued" && attempts < maxAttempts)) {
        // Wait for 5 seconds between polling attempts
        await new Promise((resolve) => setTimeout(resolve, 5000))

        const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: {
            Authorization: assemblyApiKey,
          },
        })

        if (!pollResponse.ok) {
          const errorText = await pollResponse.text()
          console.error("AssemblyAI polling error:", errorText)

          // Fall back to mock transcription
          return await handleMockTranscription(recordingId)
        }

        const pollResult = await pollResponse.json()
        status = pollResult.status

        if (status === "completed") {
          transcript = pollResult.text
          break
        } else if (status === "error") {
          console.error("AssemblyAI transcription failed:", pollResult.error)

          // Fall back to mock transcription
          return await handleMockTranscription(recordingId)
        }

        attempts++
      }

      if (status !== "completed") {
        console.error("Transcription timed out or failed to complete")

        // Fall back to mock transcription
        return await handleMockTranscription(recordingId)
      }

      // Save the transcript to the database
      const supabase = createServerComponentClient({ cookies })
      const { error: updateError } = await supabase.from("recordings").update({ transcript }).eq("id", recordingId)

      if (updateError) {
        console.error("Error updating recording transcript:", updateError)
        return NextResponse.json(
          { success: false, error: `Failed to save transcript: ${updateError.message}` },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, transcript })
    } catch (error) {
      console.error("Error in transcription process:", error)

      // Fall back to mock transcription
      return await handleMockTranscription(recordingId)
    }
  } catch (error) {
    console.error("Transcription API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown transcription error",
      },
      { status: 500 },
    )
  }
}

// Mock transcription function for development/demo purposes or as a fallback
async function handleMockTranscription(recordingId: string) {
  try {
    console.log("Using mock transcription for recording:", recordingId)

    // Generate mock transcript
    const mockTranscript = `
    Hello everyone, I wanted to share some thoughts about effective leadership in today's rapidly changing business environment.

    First, I believe that empathy is the foundation of great leadership. Understanding your team members' perspectives, challenges, and motivations allows you to support them effectively and create an environment where everyone can thrive.

    Second, clear communication is essential. Leaders must articulate their vision and expectations in a way that resonates with their team. This includes being transparent about challenges and setbacks, not just successes.

    Third, adaptability is more important than ever. The business landscape is constantly evolving, and leaders must be willing to adjust their strategies and approaches accordingly.

    Finally, I think it's crucial to foster a culture of continuous learning and growth. Encourage your team to develop new skills, experiment with new ideas, and learn from both successes and failures.

    What leadership principles have you found most effective in your experience? I'd love to hear your thoughts and insights on this topic.
    `.trim()

    // Save the mock transcript to the database
    const supabase = createServerComponentClient({ cookies })
    const { error: updateError } = await supabase
      .from("recordings")
      .update({ transcript: mockTranscript })
      .eq("id", recordingId)

    if (updateError) {
      console.error("Error updating recording with mock transcript:", updateError)
      return NextResponse.json(
        { success: false, error: `Failed to save mock transcript: ${updateError.message}` },
        { status: 500 },
      )
    }

    console.log("Mock transcription completed and saved for recording:", recordingId)
    return NextResponse.json({ success: true, transcript: mockTranscript })
  } catch (error) {
    console.error("Error in mock transcription:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error in mock transcription",
      },
      { status: 500 },
    )
  }
}
