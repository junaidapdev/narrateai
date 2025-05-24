import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">AudioBrand</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>

          <div className="mt-8 text-center">
            <Image src="/placeholder-si6hy.png" alt="AudioBrand Logo" width={60} height={60} className="mx-auto mb-4" />
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              AudioBrand helps you turn your voice recordings into engaging social media content with AI
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
