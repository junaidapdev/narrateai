"use server"
import { updateRecordingTranscript } from "@/services/recording-service"

// Function to transcribe audio using AssemblyAI
export async function transcribeAudio(audioUrl: string, recordingId: string) {
  try {
    console.log("[SERVER]\nStarting transcription for recording:", recordingId)

    // Check if we have an AssemblyAI API key
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY
    if (!assemblyApiKey) {
      console.warn("No AssemblyAI API key found, using mock transcription")
      return await mockTranscription(recordingId)
    }

    // Step 1: Upload the audio file to AssemblyAI or use the existing URL
    let uploadUrl = audioUrl

    // If the URL is a data URL or blob URL, we need to upload it to AssemblyAI
    if (audioUrl.startsWith("data:") || audioUrl.startsWith("blob:")) {
      // Get the audio file from the URL
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`)
      }

      const audioBlob = await audioResponse.blob()

      // Upload to AssemblyAI
      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          Authorization: assemblyApiKey,
          "Content-Type": "application/octet-stream",
        },
        body: audioBlob,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error("AssemblyAI upload error:", errorText)
        throw new Error(`AssemblyAI upload error: ${uploadResponse.statusText}`)
      }

      const uploadResult = await uploadResponse.json()
      uploadUrl = uploadResult.upload_url
    }

    // Step 2: Submit the transcription request
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
      throw new Error(`AssemblyAI transcription request error: ${transcriptionResponse.statusText}`)
    }

    const transcriptionResult = await transcriptionResponse.json()
    const transcriptId = transcriptionResult.id

    // Step 3: Poll for the transcription result
    let transcript = ""
    let status = "processing"
    let attempts = 0
    const maxAttempts = 60 // Maximum polling attempts (10 minutes with 10-second intervals)

    while (status === "processing" || (status === "queued" && attempts < maxAttempts)) {
      // Wait for 10 seconds between polling attempts
      await new Promise((resolve) => setTimeout(resolve, 10000))

      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          Authorization: assemblyApiKey,
        },
      })

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text()
        console.error("AssemblyAI polling error:", errorText)
        throw new Error(`AssemblyAI polling error: ${pollResponse.statusText}`)
      }

      const pollResult = await pollResponse.json()
      status = pollResult.status

      if (status === "completed") {
        transcript = pollResult.text
        break
      } else if (status === "error") {
        throw new Error(`AssemblyAI transcription failed: ${pollResult.error}`)
      }

      attempts++
    }

    if (status !== "completed") {
      throw new Error("Transcription timed out or failed to complete")
    }

    // Save the transcript to the database
    const result = await updateRecordingTranscript(recordingId, transcript)

    if (!result.success) {
      throw new Error(result.error || "Failed to save transcript")
    }

    console.log("Transcription completed and saved for recording:", recordingId)
    return { success: true, transcript }
  } catch (error) {
    console.error("Transcription error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown transcription error",
    }
  }
}

// Mock transcription function for development/demo purposes
async function mockTranscription(recordingId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

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
  const result = await updateRecordingTranscript(recordingId, mockTranscript)

  if (!result.success) {
    throw new Error(result.error || "Failed to save mock transcript")
  }

  console.log("Mock transcription completed and saved for recording:", recordingId)
  return { success: true, transcript: mockTranscript }
}
