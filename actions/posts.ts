"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

// Create a new post
export async function createPost(formData: FormData) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const hook = formData.get("hook") as string
    const body = formData.get("body") as string
    const callToAction = formData.get("callToAction") as string
    const recordingId = (formData.get("recordingId") as string) || null
    const hashtagsString = formData.get("hashtags") as string
    const hashtags = hashtagsString.split(",").map((tag) => tag.trim())

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("Not authenticated")
    }

    const userId = session.user.id

    // Insert the post
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        recording_id: recordingId,
        hook,
        body,
        call_to_action: callToAction,
        hashtags,
        status: "draft",
        is_posted: false,
        // Generate content for backward compatibility
        content: `${hook}\n\n${body}\n\n${callToAction}`,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath("/posts")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get all posts for the current user
export async function getUserPosts() {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const userId = session.user.id

    // Get posts
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching posts:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get a single post by ID
export async function getPost(id: string) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching post:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Update post
export async function updatePost(id: string, updates: any) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select().single()

    if (error) {
      throw error
    }

    revalidatePath("/posts")
    revalidatePath(`/posts/${id}`)
    revalidatePath(`/posts/${id}/edit`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating post:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Mark post as posted
export async function markPostAsPosted(id: string) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("posts")
      .update({
        status: "posted",
        is_posted: true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath("/posts")
    revalidatePath(`/posts/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error marking post as posted:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Delete a post
export async function deletePost(id: string) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const { error } = await supabase.from("posts").delete().eq("id", id)

    if (error) {
      throw error
    }

    revalidatePath("/posts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Get popular hashtags
export async function getPopularHashtags(limit = 10) {
  try {
    const supabase = createClientComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("hashtags")
      .select("*")
      .order("usage_count", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching hashtags:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function createPostAction(formData: FormData) {
  try {
    const result = await createPost(formData)
    return result
  } catch (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "Failed to create post" }
  }
}

export async function updatePostAction(formData: FormData) {
  const id = formData.get("id") as string
  const content = formData.get("content") as string
  const platform = formData.get("platform") as string
  const hook = formData.get("hook") as string
  const body = formData.get("body") as string
  const callToAction = formData.get("callToAction") as string
  const hashtagsString = formData.get("hashtags") as string
  const hashtags = hashtagsString ? hashtagsString.split(",").map((tag) => tag.trim()) : []

  try {
    const result = await updatePost(id, {
      content,
      platform,
      hook,
      body,
      call_to_action: callToAction,
      hashtags,
      updated_at: new Date().toISOString(),
    })
    return result
  } catch (error) {
    console.error("Error updating post:", error)
    return { success: false, error: "Failed to update post" }
  }
}

export async function deletePostAction(formData: FormData) {
  const id = formData.get("id") as string

  try {
    const result = await deletePost(id)
    return result
  } catch (error) {
    console.error("Error deleting post:", error)
    return { success: false, error: "Failed to delete post" }
  }
}

export async function publishPostAction(formData: FormData) {
  const id = formData.get("id") as string
  const supabase = createClientComponentClient<Database>({ cookies })

  try {
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        is_posted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/posts")
    return { success: true }
  } catch (error) {
    console.error("Error publishing post:", error)
    return { success: false, error: "Failed to publish post" }
  }
}

export async function schedulePostAction(formData: FormData) {
  const id = formData.get("id") as string
  const scheduledFor = formData.get("scheduledFor") as string
  const supabase = createClientComponentClient<Database>({ cookies })

  try {
    const { error } = await supabase
      .from("posts")
      .update({
        status: "scheduled",
        scheduled_for: scheduledFor,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/posts")
    return { success: true }
  } catch (error) {
    console.error("Error scheduling post:", error)
    return { success: false, error: "Failed to schedule post" }
  }
}
