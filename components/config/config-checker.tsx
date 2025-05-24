"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function ConfigChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Only check environment variables on the client side
    if (typeof window !== "undefined") {
      const requiredVars = [
        { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
        { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      ]

      const missing = requiredVars.filter((v) => !v.value).map((v) => v.name)
      setMissingVars(missing)
    }
  }, [])

  // Don't render anything during SSR to avoid hydration issues
  if (!isClient) return null

  // Don't show the alert if we're already on the config error page
  if (typeof window !== "undefined" && (window.location.pathname === "/config-error" || missingVars.length === 0)) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-white shadow-md">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          <p>The following environment variables are missing:</p>
          <ul className="list-disc list-inside mt-2">
            {missingVars.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="mt-2">
            Please add these variables to your environment or .env file, or{" "}
            <a href="/config-error" className="underline font-medium">
              visit the configuration error page
            </a>{" "}
            for more information.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
