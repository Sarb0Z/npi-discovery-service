import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/app/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'NPI Discovery | Healthcare Provider Search',
  description:
    'Discover healthcare providers by ZIP, city, state, and specialty with a production-grade search and analytics experience.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} app-shell antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-88px)] max-w-7xl px-6 py-10 sm:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
