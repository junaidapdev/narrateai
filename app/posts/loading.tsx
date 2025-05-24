export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="px-5 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Posts</h1>
        <div className="w-10 h-10 bg-zinc-800 rounded-full"></div>
      </header>

      {/* Tabs */}
      <div className="px-5 border-b border-zinc-800">
        <div className="flex">
          <div className="py-2 px-1 relative font-medium text-base text-white">
            Generated
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
          </div>
          <div className="py-2 px-1 ml-6 relative font-medium text-base text-zinc-500">Posted</div>
        </div>
      </div>

      {/* Loading content */}
      <div className="flex-1 px-5 py-3">
        <div className="mb-4">
          <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
          <div className="space-y-3">
            <div className="bg-zinc-900 rounded-lg p-3 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-3/4 mb-1.5"></div>
              <div className="h-3.5 bg-zinc-800 rounded w-full mb-1"></div>
              <div className="h-3.5 bg-zinc-800 rounded w-2/3 mb-3"></div>
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                </div>
                <div className="h-5 w-24 bg-zinc-800 rounded"></div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-2/3 mb-1.5"></div>
              <div className="h-3.5 bg-zinc-800 rounded w-full mb-1"></div>
              <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-3"></div>
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                  <div className="h-5 w-14 bg-zinc-800 rounded"></div>
                </div>
                <div className="h-5 w-24 bg-zinc-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
