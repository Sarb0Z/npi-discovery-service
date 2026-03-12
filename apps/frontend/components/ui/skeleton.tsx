import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-lg)] bg-[linear-gradient(180deg,hsl(var(--surface-hover)),hsl(var(--surface-strong)))] before:absolute before:inset-y-0 before:left-0 before:w-1/2 before:bg-[linear-gradient(90deg,transparent,hsl(var(--card)/0.75),transparent)] before:animate-shimmer-sweep',
        className,
      )}
    />
  )
}
