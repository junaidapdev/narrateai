export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse mb-4"></div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-3">
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse mb-1.5"></div>
            <div className="h-6 w-6 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Ready to Publish */}
      <div className="mb-6">
        <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse mb-2"></div>
        <div className="bg-zinc-900 rounded-lg p-3">
          <div className="h-5 w-full bg-zinc-800 rounded animate-pulse mb-3"></div>
          <div className="flex space-x-2">
            <div className="h-7 w-20 bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-7 w-20 bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse mb-2"></div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900 rounded-lg p-3 mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-full bg-zinc-800 rounded animate-pulse mb-2.5"></div>
            <div className="flex space-x-2">
              <div className="h-7 w-20 bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-7 w-28 bg-zinc-800 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
        <div className="flex justify-around items-center h-14">
          <div className="flex flex-col items-center">
            <div className="h-4 w-4 bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-2 w-8 bg-zinc-800 rounded animate-pulse mt-0.5"></div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 h-10 w-10 bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-2 w-8 bg-zinc-800 rounded animate-pulse mt-9"></div>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-4 w-4 bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-2 w-8 bg-zinc-800 rounded animate-pulse mt-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
