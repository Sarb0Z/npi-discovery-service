import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from '@/app/providers'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${inter.variable} app-shell antialiased`}>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-96px)] max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
