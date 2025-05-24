"use client"

import { useEffect, useState } from "react"
import { ensureRecordingsBucketExists } from "@/services/storage-service"

export function StorageInitializer() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initStorage = async () => {
      try {
        const result = await ensureRecordingsBucketExists()
        if (result.success) {
          // Remove the console log that was showing "Storage initialized successfully"
          setInitialized(true)
        } else {
          // Only log warnings for actual issues
          console.warn("Storage initialization issue:", result.error)
          setInitialized(true) // Still mark as initialized to avoid retries
        }
      } catch (err) {
        // Only log errors for exceptions
        console.error("Storage initialization error:", err)
        setError((err as Error).message)
        setInitialized(true) // Mark as initialized to avoid infinite retries
      }
    }

    if (!initialized && !error) {
      initStorage()
    }
  }, [initialized, error])

  // This component doesn't render anything visible
  return null
}
