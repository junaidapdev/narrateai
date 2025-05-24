"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getAdminClient, getServerClient } from "@/lib/supabase"

// Create a server action client safely
const createServerClient = () => {
  try {
    return createServerActionClient({ cookies })
  } catch (error) {
    console.error("Error creating server client:", error)
    throw new Error("Failed to initialize Supabase server client")
  }
}

// Create the recordings bucket if it doesn't exist
export async function ensureRecordingsBucketExists() {
  try {
    // Try to get the admin client
    const supabaseAdmin = await getAdminClient()

    // If admin client is not available, use the server client
    // Note: This will only check if the bucket exists, not create it
    const supabase = supabaseAdmin || (await getServerClient())

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      return { success: false, error: bucketsError.message }
    }

    // Check if 'recordings' bucket exists
    const recordingsBucket = buckets?.find((bucket) => bucket.name === "recordings")

    if (!recordingsBucket) {
      // If admin client is not available, we can't create the bucket
      if (!supabaseAdmin) {
        console.warn("Admin client not available. Cannot create recordings bucket.")
        return {
          success: false,
          error: "Admin client not available. Please contact your administrator to create the recordings bucket.",
        }
      }

      // Create the recordings bucket
      const { data, error } = await supabaseAdmin.storage.createBucket("recordings", {
        public: true, // Make it public so we can access files
        fileSizeLimit: 52428800, // 50MB limit
      })

      if (error) {
        console.error("Error creating recordings bucket:", error)
        return { success: false, error: error.message }
      }

      // Set up bucket policies to allow authenticated users to upload
      const { error: policyError } = await supabaseAdmin.storage
        .from("recordings")
        .createPolicy("authenticated can upload", {
          name: "authenticated can upload",
          definition: {
            role: "authenticated",
            operation: "INSERT",
          },
        })

      if (policyError) {
        console.error("Error setting bucket policy:", policyError)
        // Don't return error here, as the bucket was created successfully
      }

      // Set up bucket policies to allow authenticated users to select their own files
      const { error: selectPolicyError } = await supabaseAdmin.storage
        .from("recordings")
        .createPolicy("authenticated can select own files", {
          name: "authenticated can select own files",
          definition: {
            role: "authenticated",
            operation: "SELECT",
            check: "((storage.foldername(name))[1]) = (auth.uid())::text",
          },
        })

      if (selectPolicyError) {
        console.error("Error setting select policy:", selectPolicyError)
      }

      // Set up bucket policies to allow authenticated users to update their own files
      const { error: updatePolicyError } = await supabaseAdmin.storage
        .from("recordings")
        .createPolicy("authenticated can update own files", {
          name: "authenticated can update own files",
          definition: {
            role: "authenticated",
            operation: "UPDATE",
            check: "((storage.foldername(name))[1]) = (auth.uid())::text",
          },
        })

      if (updatePolicyError) {
        console.error("Error setting update policy:", updatePolicyError)
      }

      // Set up bucket policies to allow authenticated users to delete their own files
      const { error: deletePolicyError } = await supabaseAdmin.storage
        .from("recordings")
        .createPolicy("authenticated can delete own files", {
          name: "authenticated can delete own files",
          definition: {
            role: "authenticated",
            operation: "DELETE",
            check: "((storage.foldername(name))[1]) = (auth.uid())::text",
          },
        })

      if (deletePolicyError) {
        console.error("Error setting delete policy:", deletePolicyError)
      }

      return { success: true, message: "Recordings bucket created successfully" }
    }

    return { success: true, message: "Recordings bucket already exists" }
  } catch (error) {
    console.error("Error ensuring recordings bucket exists:", error)
    return { success: false, error: (error as Error).message }
  }
}

// The rest of the file remains unchanged
export async function getUploadUrl(fileName: string) {
  try {
    const supabase = createServerClient()

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

// Upload a file to Supabase Storage
export async function uploadFile(file: File, bucket = "recordings") {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Create a unique file path
    const filePath = `${user.id}/${Date.now()}-${file.name}`

    // Upload the file
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) {
      console.error("Error uploading file:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Delete a file from Supabase Storage
export async function deleteFile(path: string, bucket = "recordings") {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Extract the file path from the URL if it's a full URL
    const filePath = path.includes("/storage/v1/object/public/")
      ? path.split("/storage/v1/object/public/")[1].split("/").slice(1).join("/")
      : path

    // Ensure the file belongs to the current user
    if (!filePath.startsWith(user.id)) {
      return { success: false, error: "You don't have permission to delete this file" }
    }

    // Delete the file
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error("Error deleting file:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { success: false, error: (error as Error).message }
  }
}
