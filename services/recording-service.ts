"use client"

import { getSupabaseBrowser } from "@/lib/supabase"
import type { Recording } from "@/types/database"

// Get all recordings for the current user
export async function getUserRecordings() {
  try {
    const supabase = getSupabaseBrowser()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { success: false, error: "Not authenticated" }
    }

    // Get recordings
    const { data, error } = await supabase
      .from("recordings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching recordings:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Recording[] }
  } catch (error) {
    console.error("Error in getUserRecordings:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get a single recording by ID
export async function getRecording(id: string) {
  try {
    const supabase = getSupabaseBrowser()
    const { data, error } = await supabase.from("recordings").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching recording:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Recording }
  } catch (error) {
    console.error("Error in getRecording:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a new recording (client-side version)
export async function createRecordingClient(data: Partial<Recording>) {
  try {
    const supabase = getSupabaseBrowser()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error getting user:", userError)
      return { success: false, error: "Not authenticated" }
    }

    // Insert the recording
    const { data: recording, error } = await supabase
      .from("recordings")
      .insert({
        user_id: user.id,
        title: data.title || "Untitled Recording",
        duration: data.duration || 0,
        audio_url: data.audio_url,
        status: data.status || "completed",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating recording:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: recording as Recording }
  } catch (error) {
    console.error("Error in createRecordingClient:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Update a recording
export async function updateRecording(id: string, data: Partial<Recording>) {
  try {
    const supabase = getSupabaseBrowser()

    // Update the recording
    const { data: recording, error } = await supabase.from("recordings").update(data).eq("id", id).select().single()

    if (error) {
      console.error("Error updating recording:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: recording as Recording }
  } catch (error) {
    console.error("Error in updateRecording:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Update a recording's transcript
export async function updateRecordingTranscript(id: string, transcript: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Update the recording transcript
    const { data: recording, error } = await supabase
      .from("recordings")
      .update({
        transcript,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating recording transcript:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: recording as Recording }
  } catch (error) {
    console.error("Error in updateRecordingTranscript:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Delete a recording
export async function deleteRecording(id: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Get the recording to find the audio URL
    const { data: recording, error: fetchError } = await supabase
      .from("recordings")
      .select("audio_url")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching recording:", fetchError)
      return { success: false, error: fetchError.message }
    }

    // Delete the audio file from storage if it exists
    if (recording?.audio_url) {
      try {
        const filePath = recording.audio_url.split("/").slice(-2).join("/")
        const { error: storageError } = await supabase.storage.from("recordings").remove([filePath])

        if (storageError) {
          console.error("Error deleting audio file:", storageError)
          // Continue with deletion even if file removal fails
        }
      } catch (storageError) {
        console.error("Error in storage operation:", storageError)
        // Continue with deletion even if file removal fails
      }
    }

    // Delete the recording record
    const { error } = await supabase.from("recordings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting recording:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteRecording:", error)
    return { success: false, error: (error as Error).message }
  }
}
