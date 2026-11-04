import type { Metadata } from 'next'
import { Header } from '@/widgets/header'
import { Providers } from '../providers/Providers'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Book Tracker',
  icons: '/favicon.svg',
}

// Root layout: a Server Component that replaces index.html; Providers is the client boundary inside it
export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="mx-auto max-w-5xl px-4 py-6">
            <Header />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
