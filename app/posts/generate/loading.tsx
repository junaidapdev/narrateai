export default function GeneratePostLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="w-5 h-5 bg-zinc-800 rounded-full animate-pulse"></div>
          <div className="w-24 h-4 bg-zinc-800 rounded animate-pulse"></div>
          <div className="w-5 h-5 bg-zinc-800 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 pt-14 pb-6">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-zinc-800"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-2 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-xs text-zinc-500">Loading recording...</p>
        </div>
      </div>
    </div>
  )
}
