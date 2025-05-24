"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Create the recordings bucket if it doesn't exist
export async function ensureRecordingsBucketExists() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }

    // Check if 'recordings' bucket exists
    const recordingsBucket = buckets?.find((bucket) => bucket.name === "recordings")

    if (!recordingsBucket) {
      // Create the recordings bucket
      const { data, error } = await supabase.storage.createBucket("recordings", {
        public: false, // Set to true if you want files to be publicly accessible
        fileSizeLimit: 52428800, // 50MB limit
      })

      if (error) {
        console.error("Error creating recordings bucket:", error)
        return { success: false, error: error.message }
      }

      // Set up bucket policies
      const { error: policyError } = await supabase.storage
        .from("recordings")
        .createPolicy("Authenticated users can upload recordings", {
          name: "authenticated-can-upload",
          definition: {
            role_id: "authenticated",
            operation: "INSERT",
          },
        })

      if (policyError) {
        console.error("Error setting bucket policy:", policyError)
        return { success: false, error: policyError.message }
      }

      return { success: true, message: "Recordings bucket created successfully" }
    }

    return { success: true, message: "Recordings bucket already exists" }
  } catch (error) {
    console.error("Error ensuring recordings bucket exists:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a function to get a presigned URL for uploading
export async function getUploadUrl(fileName: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Create a unique file path
    const filePath = `${user.id}/${Date.now()}-${fileName}`

    // Create a signed URL for uploading
    const { data, error } = await supabase.storage.from("recordings").createSignedUploadUrl(filePath)

    if (error) {
      console.error("Error creating signed URL:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        path: filePath,
        fullUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recordings/${filePath}`,
      },
    }
  } catch (error) {
    console.error("Error getting upload URL:", error)
    return { success: false, error: (error as Error).message }
  }
}
