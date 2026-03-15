import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex gap-4 rounded-[var(--radius-lg)] border p-5 text-sm leading-relaxed [&>svg]:mt-0.5 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-[hsl(var(--border)/0.75)] bg-[hsl(var(--card)/0.72)] text-[hsl(var(--ink-900))] shadow-[var(--shadow-sm)] backdrop-blur-sm [&>svg]:text-[hsl(var(--ink-600))]',
        info: 'border-[hsl(var(--info)/0.3)] bg-[var(--info-soft)] text-[hsl(var(--info-foreground))] [&>svg]:text-[hsl(var(--info))]',
        success:
          'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success-foreground))] [&>svg]:text-[hsl(var(--success))]',
        warning:
          'border-[hsl(var(--warning)/0.3)] bg-[var(--warning-soft)] text-[hsl(var(--warning-foreground))] [&>svg]:text-[hsl(var(--warning))]',
        destructive:
          'border-[hsl(var(--destructive)/0.3)] bg-[var(--danger-soft)] text-[hsl(var(--destructive))] [&>svg]:text-[hsl(var(--destructive))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} role="alert" {...props} />
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn(
        'font-display text-base font-semibold tracking-[var(--tracking-tight)]',
        className,
      )}
      {...props}
    />
  )
}

export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed opacity-90', className)} {...props} />
}
