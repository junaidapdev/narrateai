export default function ConfigErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
        <p className="text-gray-600 mb-4">Missing required environment variables</p>

        <div className="mb-6">
          <p className="mb-4">
            The application is missing required environment variables. Please make sure the following variables are set:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY (for admin operations)</li>
          </ul>
          <p className="text-gray-700">
            You can set these variables in your environment or in a .env file. See the documentation for more
            information.
          </p>
        </div>

        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Try Again
        </a>
      </div>
    </div>
  )
}
