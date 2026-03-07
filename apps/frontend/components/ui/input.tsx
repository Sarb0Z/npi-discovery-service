import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-[var(--ink-500)] focus:border-[var(--brand-400)] focus:ring-4 focus:ring-[var(--brand-soft)]',
        className,
      )}
      {...props}
    />
  )
}
