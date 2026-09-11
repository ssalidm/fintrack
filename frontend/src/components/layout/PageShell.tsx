import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
}

export default function PageShell({
  children,
}: PageShellProps) {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {children}
      </div>
    </main>
  )
}