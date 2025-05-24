export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md px-4">
        <div className="space-y-12">
          {/* Progress circle skeleton */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="2" />
              </svg>

              {/* Loading indicator in the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>

            {/* Loading text */}
            <div className="mt-4 text-center">
              <div className="h-7 w-24 bg-gray-800 rounded animate-pulse mx-auto" />
            </div>
          </div>

          {/* Step indicators skeleton */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
