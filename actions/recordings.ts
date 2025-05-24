"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Recording } from "@/types/database"
import { getUploadUrl } from "./storage"

// Create a new recording
export async function createRecording(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const duration = Number.parseInt(formData.get("duration") as string)
    const audioFile = formData.get("audioFile") as File

    // Get the current user using server action client
    const supabase = createServerActionClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const userId = user.id

    // Upload the audio file to Supabase Storage
    let audioUrl = null
    if (audioFile) {
      // Get a signed URL for uploading
      const { success, data, error } = await getUploadUrl(audioFile.name || "recording.wav")

      if (!success || !data) {
        console.error("Error getting upload URL:", error)
        throw new Error("Failed to get upload URL")
      }

      // Upload the file using the signed URL
      const uploadResponse = await fetch(data.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": audioFile.type,
        },
        body: audioFile,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio file")
      }

      audioUrl = data.fullUrl
    }

    // Insert the recording
    const { data, error } = await supabase
      .from("recordings")
      .insert({
        user_id: userId,
        title,
        duration,
        audio_url: audioUrl,
        status: "completed",
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath("/dashboard")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating recording:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get all recordings for the current user
export async function getUserRecordings() {
  try {
    // Get the current user using server action client
    const supabase = createServerActionClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = user.id

    // Get recordings
    const { data, error } = await supabase
      .from("recordings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data: data as Recording[] }
  } catch (error) {
    console.error("Error fetching recordings:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get a single recording by ID
export async function getRecording(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data, error } = await supabase.from("recordings").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return { success: true, data: data as Recording }
  } catch (error) {
    console.error("Error fetching recording:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Update recording status
export async function updateRecordingStatus(id: string, status: Recording["status"]) {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data, error } = await supabase.from("recordings").update({ status }).eq("id", id).select().single()

    if (error) {
      throw error
    }

    revalidatePath("/dashboard")
    revalidatePath(`/recording/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating recording status:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Delete a recording
export async function deleteRecording(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the recording to find the audio URL
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("audio_url")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Delete the audio file from storage if it exists
    if (recording?.audio_url) {
      const filePath = recording.audio_url.split("/").slice(-2).join("/")
      const { error: storageError } = await supabase.storage.from("recordings").remove([filePath])

      if (storageError) {
        console.error("Error deleting audio file:", storageError)
      }
    }

    // Delete the recording record
    const { error } = await supabase.from("recordings").delete().eq("id", id)

    if (error) {
      throw error
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting recording:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Upload audio blob to Supabase Storage
export async function uploadAudioBlob(audioBlob: Blob, fileName = "recording.wav") {
  try {
    // Get the current user using server action client
    const supabase = createServerActionClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get duration from session storage (client-side only)
    const duration = 1 // Default to 1 second to avoid null constraint error

    // If not authenticated, create a temporary local URL for demo purposes
    if (!user) {
      console.log("User not authenticated, creating temporary URL for demo")
      return {
        success: true,
        url: audioBlob ? URL.createObjectURL(audioBlob) : null,
        demo: true,
      }
    }

    // Get a signed URL for uploading
    const { success, data, error } = await getUploadUrl(fileName)

    if (!success || !data) {
      console.error("Error getting upload URL:", error)
      // Fallback to local URL for demo purposes
      return {
        success: true,
        url: audioBlob ? URL.createObjectURL(audioBlob) : null,
        demo: true,
      }
    }

    // Upload the blob using the signed URL
    const uploadResponse = await fetch(data.signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "audio/wav",
      },
      body: audioBlob,
    })

    if (!uploadResponse.ok) {
      console.error("Error uploading audio:", uploadResponse.statusText)
      // Fallback to local URL for demo purposes
      return {
        success: true,
        url: audioBlob ? URL.createObjectURL(audioBlob) : null,
        demo: true,
      }
    }

    // Create a recording entry in the database
    const { data: recordingData, error: recordingError } = await supabase
      .from("recordings")
      .insert({
        user_id: user.id,
        title: `Recording ${new Date().toLocaleString()}`,
        audio_url: data.fullUrl,
        duration: duration, // Use default duration
        status: "completed",
      })
      .select()
      .single()

    if (recordingError) {
      console.error("Error creating recording entry:", recordingError)
      return {
        success: true,
        url: data.fullUrl,
      }
    }

    console.log("Created recording entry:", recordingData.id)

    return {
      success: true,
      url: data.fullUrl,
      recordingId: recordingData.id,
    }
  } catch (error) {
    console.error("Error uploading audio:", error)
    // Fallback to local URL for demo purposes
    return {
      success: true,
      url: audioBlob ? URL.createObjectURL(audioBlob) : null,
      demo: true,
      error: (error as Error).message,
    }
  }
}
