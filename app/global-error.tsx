"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              The application encountered a critical error. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => reset()} variant="default">
                Try again
              </Button>
              <Button onClick={() => (window.location.href = "/")} variant="outline">
                Go to home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
