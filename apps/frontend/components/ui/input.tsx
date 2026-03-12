import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card)/0.82)] px-4 text-sm text-[hsl(var(--ink-900))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)] outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-[hsl(var(--ink-500))] focus:border-[hsl(var(--primary)/0.8)] focus:bg-[hsl(var(--card)/0.95)] focus:ring-4 focus:ring-[hsl(var(--ring)/0.16)]',
        className,
      )}
      {...props}
    />
  )
}
