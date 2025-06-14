// Import createClient dynamically to avoid the export error
export const createAdminClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is missing")
  }

  // Import createClient dynamically
  const { createClient } = await import("@supabase/supabase-js")
  return createClient(supabaseUrl, supabaseServiceKey)
}
