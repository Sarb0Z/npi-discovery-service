'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Database,
  FileDown,
  Search,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const capabilities = [
  {
    icon: Search,
    title: 'Provider search',
    description:
      'Query by NPI, ZIP code, city, state, or specialty. Partition-aware fetching handles broad queries within API limits.',
    href: '/search',
    gradient: 'from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.05)]',
    iconColor: 'text-[hsl(var(--primary))]',
  },
  {
    icon: BarChart3,
    title: 'Market analytics',
    description:
      'Live breakdowns of provider types, top cities, leading specialties, and taxonomy distribution for any search.',
    href: '/statistics',
    gradient: 'from-[hsl(var(--secondary)/0.2)] to-[hsl(var(--secondary)/0.05)]',
    iconColor: 'text-[hsl(var(--secondary))]',
  },
  {
    icon: FileDown,
    title: 'Bulk export',
    description:
      'Background collection jobs for large datasets. Monitor progress in real time and download when ready.',
    href: '/bulk',
    gradient: 'from-[hsl(var(--tertiary)/0.2)] to-[hsl(var(--tertiary)/0.05)]',
    iconColor: 'text-[hsl(var(--tertiary))]',
  },
] as const

const principles = [
  {
    icon: Zap,
    title: 'Partition intelligence',
    description:
      'Broad state-wide queries are automatically partitioned so they return full coverage without hitting NPPES rate limits.',
  },
  {
    icon: Shield,
    title: 'Contract-first types',
    description:
      'Shared TypeScript contracts keep every DTO, enum, and validator in sync between the API and frontend.',
  },
  {
    icon: Database,
    title: 'Async pipeline',
    description:
      'Heavy exports run as background jobs with Redis-backed queues and WebSocket progress, never blocking the UI.',
  },
] as const

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

export function HomePage() {
  return (
    <div className="animate-page-enter space-y-20">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[36px] border border-[hsl(var(--border)/0.7)] bg-[linear-gradient(170deg,hsl(var(--card)/0.92),hsl(var(--card)/0.6)_68%,hsl(var(--surface)/0.5))] p-10 shadow-[var(--shadow-xl)] backdrop-blur-2xl sm:p-14 lg:p-20">
        {/* Decorative blobs */}
        <div className="absolute -left-16 top-16 h-72 w-72 rounded-full bg-[hsl(var(--primary)/0.12)] blur-[80px]" />
        <div className="absolute -right-10 bottom-10 h-60 w-60 rounded-full bg-[hsl(var(--secondary)/0.14)] blur-[70px]" />
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-[hsl(var(--tertiary)/0.08)] blur-[60px]" />

        {/* Floating particles */}
        <div className="animate-float absolute right-[18%] top-[14%] h-3 w-3 rounded-full bg-[hsl(var(--secondary))]" />
        <div className="animate-drift-x absolute bottom-[22%] left-[12%] h-2 w-2 rounded-full bg-[hsl(var(--tertiary))]" />
        <div
          className="animate-float absolute bottom-[38%] right-[8%] h-2 w-2 rounded-full bg-[hsl(var(--primary)/0.7)]"
          style={{ animationDelay: '1.2s' }}
        />

        <div className="relative max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-700)] ring-1 ring-[hsl(var(--secondary)/0.16)]">
              <Sparkles className="h-4 w-4" />
              National Provider Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-display-xl text-[var(--ink-900)]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
          >
            One place to search, analyze, and export{' '}
            <span className="text-gradient-brand">every healthcare provider</span> in the national
            registry.
          </motion.h1>

          <motion.p
            className="max-w-xl text-lg leading-8 text-[var(--ink-600)] sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.55 }}
          >
            Powered by the CMS NPPES API with intelligent partition-based searching, real-time
            analytics, and async bulk collection — so broad queries never hit dead ends.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
          >
            <Button asChild variant="gradient" size="lg">
              <Link href="/search">
                <Search className="h-4.5 w-4.5" />
                Start searching
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/statistics">
                <BarChart3 className="h-4.5 w-4.5" />
                View analytics
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Hero illustration — activity pulse */}
        <motion.div
          className="absolute -right-4 bottom-6 hidden aspect-square w-44 items-center justify-center rounded-[28px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.7)] shadow-[var(--shadow-lg)] backdrop-blur-xl lg:flex xl:w-56"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Activity className="h-16 w-16 text-[hsl(var(--primary)/0.6)] xl:h-20 xl:w-20" />
        </motion.div>
      </section>

      {/* ── Capability cards ───────────────────────── */}
      <motion.section
        className="grid gap-6 md:grid-cols-3"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        {capabilities.map(({ icon: Icon, title, description, href, gradient, iconColor }) => (
          <motion.div key={title} variants={fadeUp}>
            <Link
              href={href}
              className="glass-panel group flex flex-col gap-5 rounded-[28px] p-7 transition-transform duration-300 hover:-translate-y-1"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br ${gradient} ring-1 ring-[hsl(var(--border)/0.4)] transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-lg font-semibold text-[var(--ink-900)]">
                  {title}
                </h3>
                <p className="text-sm leading-6 text-[var(--ink-600)]">{description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--primary))] transition-transform duration-200 group-hover:translate-x-1">
                Explore
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* ── Principles strip ───────────────────────── */}
      <motion.section
        className="space-y-8"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <h2 className="text-display-md text-[var(--ink-900)]">
            Built on <span className="text-gradient-brand">first principles</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[var(--ink-600)]">
            Every layer of the stack — from the shared contract package to the Recharts
            visualizations — is designed for reliability, type safety, and speed.
          </p>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {principles.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="relative rounded-[28px] border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card)/0.64)] p-7 backdrop-blur-sm"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--surface))] ring-1 ring-[hsl(var(--border)/0.6)]">
                <Icon className="h-5 w-5 text-[var(--ink-600)]" />
              </span>
              <h4 className="font-display text-base font-semibold text-[var(--ink-900)]">
                {title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── CTA banner ─────────────────────────────── */}
      <motion.section
        className="rounded-[32px] border border-[hsl(var(--border)/0.6)] bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),hsl(var(--secondary)/0.08),hsl(var(--tertiary)/0.06))] p-10 text-center backdrop-blur-sm sm:p-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55 }}
      >
        <h2 className="text-display-sm text-[var(--ink-900)]">Ready to discover providers?</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--ink-600)]">
          Jump straight into the search experience — no setup, no sign-up. Every query goes live
          against the NPPES registry.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="glow" size="lg">
            <Link href="/search">
              <Search className="h-4.5 w-4.5" />
              Launch search
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/bulk">
              <FileDown className="h-4.5 w-4.5" />
              Bulk export
            </Link>
          </Button>
        </div>
      </motion.section>
    </div>
  )
}
