import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', {
  variants: {
    variant: {
      neutral: 'bg-[hsl(var(--surface-hover)/0.92)] text-[hsl(var(--ink-700))] ring-1 ring-inset ring-[hsl(var(--border)/0.7)]',
      primary: 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary-hover))] ring-1 ring-inset ring-[hsl(var(--primary)/0.14)]',
      success: 'bg-[hsl(var(--secondary)/0.14)] text-[hsl(var(--secondary-active))] ring-1 ring-inset ring-[hsl(var(--secondary)/0.14)]',
      warning: 'bg-[hsl(var(--warning)/0.18)] text-[hsl(var(--warning-foreground))] ring-1 ring-inset ring-[hsl(var(--warning)/0.14)]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
