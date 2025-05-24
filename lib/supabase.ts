"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database"

// Export a default supabase client instance for compatibility
export const supabase = typeof window !== "undefined" ? createClientComponentClient<Database>() : null

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Store the singleton instance
let browserClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Get the Supabase client for browser usage (singleton pattern)
export function getSupabaseBrowser() {
  if (!isBrowser) {
    throw new Error("getSupabaseBrowser should only be called in browser environment")
  }

  if (!browserClient) {
    // Create the client only once
    browserClient = createClientComponentClient<Database>()
  }

  return browserClient
}

// Get the Supabase client for server usage
export function getServerClient() {
  // In Next.js, we need to use the environment variables directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables for server client")
  }

  // Import createClient dynamically to avoid the export error
  return import("@supabase/supabase-js").then(({ createClient }) => {
    return createClient<Database>(supabaseUrl, supabaseKey)
  })
}

// Get the Supabase admin client
export async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  // Import createClient dynamically to avoid the export error
  return import("@supabase/supabase-js").then(({ createClient }) => {
    return createClient<Database>(supabaseUrl, supabaseServiceKey)
  })
}

// Check if Supabase configuration is valid
export function isValidConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
