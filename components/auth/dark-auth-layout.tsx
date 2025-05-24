import Link from "next/link"
import type { ReactNode } from "react"

interface DarkAuthLayoutProps {
  children: ReactNode
  title: string
}

export function DarkAuthLayout({ children, title }: DarkAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-6">
        <div className="max-w-md mx-auto w-full">
          <Link href="/" className="text-3xl font-bold">
            AudioBrand
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-8">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}
