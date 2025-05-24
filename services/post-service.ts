"use client"

import { getSupabaseBrowser } from "@/lib/supabase"
import type { Post } from "@/types/database"

// Get all posts for the current user
export async function getUserPosts() {
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

    // Get posts
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Post[] }
  } catch (error) {
    console.error("Error in getUserPosts:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get a single post by ID
export async function getPost(id: string) {
  try {
    const supabase = getSupabaseBrowser()
    const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching post:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Post }
  } catch (error) {
    console.error("Error in getPost:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a new post (client-side version)
export async function createPostClient(data: Partial<Post>) {
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

    // Insert the post - only include fields that exist in the database schema
    const postData = {
      user_id: user.id,
      content: data.content || "",
      platform: data.platform || "linkedin",
      status: data.status || "draft",
      recording_id: data.recording_id,
      scheduled_for: data.scheduled_for,
    }

    // Insert the post
    const { data: post, error } = await supabase.from("posts").insert(postData).select().single()

    if (error) {
      console.error("Error creating post:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: post as Post }
  } catch (error) {
    console.error("Error in createPostClient:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a new post (server-side alias for createPostClient)
export const createPost = createPostClient

// Update a post
export async function updatePost(id: string, data: Partial<Post>) {
  try {
    const supabase = getSupabaseBrowser()

    // Only include fields that exist in the database schema
    const updateData: Partial<Post> = {
      content: data.content,
      platform: data.platform,
      status: data.status,
      scheduled_for: data.scheduled_for,
      updated_at: new Date().toISOString(),
    }

    // Update the post
    const { data: post, error } = await supabase.from("posts").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("Error updating post:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: post as Post }
  } catch (error) {
    console.error("Error in updatePost:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Delete a post
export async function deletePost(id: string) {
  try {
    const supabase = getSupabaseBrowser()

    // Delete the post
    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting post:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deletePost:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Update post status
export async function updatePostStatus(id: string, status: Post["status"]) {
  try {
    const supabase = getSupabaseBrowser()

    const { data, error } = await supabase.from("posts").update({ status }).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating post status:", error)
    return { success: false, error: (error as Error).message }
  }
}
