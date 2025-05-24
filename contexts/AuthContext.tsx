"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowser } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the current session and user
  const getUser = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Only run in browser
      if (typeof window === "undefined") {
        setIsLoading(false)
        return
      }

      const supabase = getSupabaseBrowser()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        // Ignore "Auth session missing!" error as it's expected when not logged in
        if (error.message !== "Auth session missing!") {
          console.error("Error getting session:", error)
          setError(error.message)
        }
        setUser(null)
        setSession(null)
      } else if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)
      } else {
        setUser(null)
        setSession(null)
      }
    } catch (err) {
      console.error("Error in getUser:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setUser(null)
      setSession(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh the user data
  const refreshUser = useCallback(async () => {
    await getUser()
  }, [getUser])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseBrowser()
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
    } catch (err) {
      console.error("Error signing out:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set up auth state listener
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return

    getUser()

    try {
      const supabase = getSupabaseBrowser()
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        authListener?.subscription.unsubscribe()
      }
    } catch (err) {
      console.error("Error setting up auth listener:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }, [getUser])

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
