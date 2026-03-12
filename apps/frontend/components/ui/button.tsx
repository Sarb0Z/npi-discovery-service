import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const BASE_INTERACTIVE_CLASSES = [
  'inline-flex',
  'items-center',
  'justify-center',
  'gap-2',
  'rounded-full',
  'font-semibold',
  'transition-[transform,box-shadow,background-color,border-color,color,opacity]',
  'duration-300',
  'ease-out',
  'hover:-translate-y-0.5',
  'hover:scale-[1.02]',
  'active:translate-y-0',
  'active:scale-[0.98]',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-[hsl(var(--ring)/0.35)]',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-[hsl(var(--background))]',
  'disabled:pointer-events-none',
  'disabled:opacity-50',
].join(' ')

const buttonVariants = cva(
  `${BASE_INTERACTIVE_CLASSES} text-sm`,
  {
    variants: {
      variant: {
        primary:
          'bg-[hsl(var(--primary))] px-5 py-3 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow)] hover:bg-[hsl(var(--primary-hover))] active:bg-[hsl(var(--primary-active))]',
        secondary:
          'bg-[hsl(var(--card)/0.78)] px-5 py-3 text-[hsl(var(--ink-900))] ring-1 ring-[hsl(var(--border)/0.9)] shadow-[var(--shadow-sm)] hover:bg-[hsl(var(--card))]',
        ghost:
          'px-4 py-2 text-[hsl(var(--ink-700))] hover:bg-[hsl(var(--foreground)/0.06)] hover:text-[hsl(var(--ink-900))]',
        outline:
          'bg-transparent px-5 py-3 text-[hsl(var(--ink-900))] ring-1 ring-[hsl(var(--border))] hover:bg-[hsl(var(--card)/0.7)]',
        gradient:
          'bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary))_58%,hsl(var(--tertiary)))] px-5 py-3 text-white shadow-[0_24px_55px_-22px_hsl(var(--primary)/0.7)] hover:shadow-[0_28px_65px_-24px_hsl(var(--primary)/0.85)]',
        glow:
          'bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--secondary)),hsl(var(--primary)))] bg-[length:200%_100%] px-5 py-3 text-white shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_0_24px_hsl(var(--primary)/0.3),0_18px_44px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.26),0_0_30px_hsl(var(--primary)/0.45),0_22px_54px_hsl(var(--primary)/0.5)] animate-shimmer-sweep',
        pill:
          'bg-[hsl(var(--surface))] px-5 py-3 text-[hsl(var(--ink-900))] ring-1 ring-[hsl(var(--border)/0.85)] shadow-[var(--shadow-sm)] hover:bg-[hsl(var(--surface-hover))]',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
