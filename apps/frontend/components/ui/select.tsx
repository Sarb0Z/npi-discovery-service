'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-12 w-full items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--input))] bg-[hsl(var(--card)/0.82)] px-4 text-sm text-[hsl(var(--ink-900))] outline-none transition-[border-color,box-shadow,background-color] duration-300 focus:border-[hsl(var(--primary)/0.8)] focus:bg-[hsl(var(--card)/0.95)] focus:ring-4 focus:ring-[hsl(var(--ring)/0.16)]',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 text-[hsl(var(--ink-500))]" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'z-50 overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--border)/0.9)] bg-[hsl(var(--popover)/0.96)] shadow-[var(--shadow-lg)] backdrop-blur-2xl',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-2">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-default items-center rounded-[var(--radius-md)] py-2 pl-9 pr-3 text-sm text-[hsl(var(--ink-700))] outline-none transition-colors data-[highlighted]:bg-[hsl(var(--surface-hover))] data-[state=checked]:text-[hsl(var(--ink-900))]',
        className,
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
