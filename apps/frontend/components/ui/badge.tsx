import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-[var(--surface-200)] text-[var(--ink-700)]',
      primary: 'bg-[var(--brand-soft)] text-[var(--brand-700)]',
      success: 'bg-[var(--accent-soft)] text-[var(--accent-700)]',
      warning: 'bg-[var(--warning-soft)] text-[var(--warning-700)]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
