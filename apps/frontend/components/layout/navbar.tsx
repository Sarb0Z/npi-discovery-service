'use client'

import { motion } from 'framer-motion'
import { Activity, Menu, Moon, Sparkles, Sun, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { useSyncExternalStore } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
      <div className="glass-panel mx-auto flex max-w-[1440px] items-center justify-between gap-4 rounded-[28px] px-4 py-3 sm:px-6">
        <Link className="group flex items-center gap-3" href="/" onClick={() => setMobileOpen(false)}>
          <span className="relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary))_60%,hsl(var(--tertiary)))] text-white shadow-[var(--shadow)] transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 rounded-[18px] bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.34),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Activity className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-500)]">
              National Provider Intelligence
            </span>
            <span className="font-display block text-base font-semibold text-[var(--ink-900)] sm:text-lg">
              NPI Discovery
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--card)/0.78)] p-1 shadow-[var(--shadow-sm)] md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                className={cn(
                  'font-display relative rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'text-[var(--ink-900)]'
                    : 'text-[var(--ink-600)] hover:text-[var(--ink-900)]',
                )}
                href={item.href}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(135deg,hsl(var(--card)),hsl(var(--surface-hover)))] shadow-[var(--shadow-sm)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full bg-[hsl(var(--accent)/0.7)] px-3 py-1 text-xs font-medium text-[hsl(var(--accent-foreground))] lg:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Premium provider workflow
          </span>
          <Button
            aria-label="Toggle theme"
            size="icon"
            variant="pill"
            disabled={!isMounted}
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {!isMounted ? (
              <Moon className="h-4 w-4" />
            ) : resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            aria-label="Toggle navigation"
            className="md:hidden"
            size="icon"
            variant="secondary"
            onClick={() => setMobileOpen((current) => !current)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {mobileOpen ? (
        <div className="mx-auto mt-3 max-w-[1440px] px-1 md:hidden">
          <div className="glass-panel flex flex-col gap-2 rounded-[24px] p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  className={cn(
                    'font-display rounded-[18px] px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-[linear-gradient(135deg,hsl(var(--primary)/0.14),hsl(var(--secondary)/0.14))] text-[var(--ink-900)]'
                      : 'text-[var(--ink-600)] hover:bg-[hsl(var(--surface-hover))] hover:text-[var(--ink-900)]',
                  )}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}
