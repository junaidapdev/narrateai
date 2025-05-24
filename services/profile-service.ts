import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>,
): Promise<Profile | null> {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const supabase = createClientComponentClient()

  // Create a unique file name
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `avatars/${fileName}`

  // Upload the file
  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError)
    return null
  }

  // Get the public URL
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

  // Update the user's profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: data.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating profile with avatar:", updateError)
    return null
  }

  return data.publicUrl
}
