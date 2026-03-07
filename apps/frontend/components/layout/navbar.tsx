'use client'

import { motion } from 'framer-motion'
import { Activity, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/search', label: 'Search' },
  { href: '/statistics', label: 'Statistics' },
  { href: '/bulk', label: 'Bulk Export' },
] as const

export function Navbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link className="flex items-center gap-3" href="/search">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-600),var(--accent-500))] text-white shadow-lg">
            <Activity className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-500)]">
              NPI Discovery
            </span>
            <span className="block text-base font-semibold text-[var(--ink-900)]">
              Provider intelligence, designed well
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 p-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive ? 'text-[var(--ink-900)]' : 'text-[var(--ink-600)] hover:text-[var(--ink-900)]',
                )}
                href={item.href}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-[var(--surface-200)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Button
          aria-label="Toggle theme"
          size="icon"
          variant="secondary"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
