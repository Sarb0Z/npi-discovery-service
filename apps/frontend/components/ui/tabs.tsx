'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex rounded-full border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--surface)/0.8)] p-1 shadow-[var(--shadow-sm)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'font-display rounded-full px-4 py-2 text-sm font-medium text-[hsl(var(--ink-600))] transition-[background-color,color,box-shadow,transform] duration-300 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-[hsl(var(--ink-900))] data-[state=active]:shadow-[var(--shadow-sm)] data-[state=active]:-translate-y-px',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content
