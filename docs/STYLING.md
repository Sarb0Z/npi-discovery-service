
# 1. Design System & Theming

## Theming solution

The web app uses a **hybrid token-based Tailwind system** built on:

- **Tailwind CSS 3.4**
- **CSS custom properties** in `globals.css`
- **`next-themes`** for light/dark/system theme switching
- **CVA (`class-variance-authority`)** for component variants
- **Radix UI primitives** as the base for several interactive components

Evidence:

```typescript 
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          hover: 'hsl(var(--secondary-hover))',
          active: 'hsl(var(--secondary-active))',
        },
```

Theme runtime:

```tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

Theme hook:

```typescript
'use client'

import { useTheme as useNextTheme } from 'next-themes'
...
export function useTheme() {
  const { theme, setTheme, resolvedTheme, themes, systemTheme } = useNextTheme()
...
  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }
...
}
```

## Where theme is defined

Primary token definition is in:

- `apps/web-tourist/src/app/globals.css`
- `apps/web-tourist/tailwind.config.ts`

Theme utility helpers also exist in:

- `apps/web-tourist/src/lib/utils/theme-utils.ts`

## Where theme is consumed

Consumed throughout:

- Tailwind semantic classes like `bg-background`, `text-foreground`, `bg-primary`, `border-input`
- CVA-powered shared components like `Button`, `Input`, `Alert`, `Dialog`
- Theme hooks (`useTheme`, `useThemeClasses`, `useThemeTransition`)
- animation and gradient utilities referencing `--primary`, `--secondary`, etc.

---

## Design tokens found

### Color tokens

From Tailwind config, the token names include:

- `border`
- `input`
- `ring`
- `background`
- `foreground`
- `primary`
  - `DEFAULT`
  - `foreground`
  - `hover`
  - `active`
- `secondary`
  - `DEFAULT`
  - `foreground`
  - `hover`
  - `active`
- `tertiary`
  - `DEFAULT`
  - `foreground`
  - `hover`
  - `active`
- `destructive`
  - `DEFAULT`
  - `foreground`
- `success`
  - `DEFAULT`
  - `foreground`
- `warning`
  - `DEFAULT`
  - `foreground`
- `info`
  - `DEFAULT`
  - `foreground`
- `muted`
  - `DEFAULT`
  - `foreground`
- `accent`
  - `DEFAULT`
  - `foreground`
- `popover`
  - `DEFAULT`
  - `foreground`
- `card`
  - `DEFAULT`
  - `foreground`
- `surface`
  - `DEFAULT`
  - `foreground`
  - `hover`

### Concrete CSS variable values found

From `globals.css` snippet:

```css
/* Surface colors */
--surface: 0 0% 98%;
--surface-foreground: 222.2 84% 4.9%;
--surface-hover: 210 40% 96%;

/* Border and input */
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 275 85% 60%;
```

This snippet confirms actual HSL token values for at least:

| Token | Value |
|---|---|
| `--surface` | `0 0% 98%` |
| `--surface-foreground` | `222.2 84% 4.9%` |
| `--surface-hover` | `210 40% 96%` |
| `--border` | `214.3 31.8% 91.4%` |
| `--input` | `214.3 31.8% 91.4%` |
| `--ring` | `275 85% 60%` |

Because the search result is partial, I cannot claim a complete value table for all tokens without more file extraction. But the naming system clearly expects a full semantic token set in `globals.css`.

### Border radii

Defined in Tailwind via CSS vars:

| Token | Value |
|---|---|
| `sm` | `var(--radius-sm)` |
| `DEFAULT` | `var(--radius)` |
| `md` | `var(--radius-md)` |
| `lg` | `var(--radius-lg)` |
| `xl` | `var(--radius-xl)` |

Concrete values found:

| CSS variable | Value |
|---|---|
| `--radius` | `0.5rem` |
| `--radius-sm` | `0.25rem` |
| `--radius-md` | `0.375rem` |
| `--radius-lg` | `0.75rem` |
| `--radius-xl` | `1rem` |

### Shadows

Tailwind maps shadows to CSS vars:

| Token | Value source |
|---|---|
| `sm` | `var(--shadow-sm)` |
| `DEFAULT` | `var(--shadow)` |
| `md` | `var(--shadow-md)` |
| `lg` | `var(--shadow-lg)` |
| `xl` | `var(--shadow-xl)` |

Concrete values found:

| CSS variable | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |

### Font families

Defined in layout + CSS vars:

```tsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
...
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})
...
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
```

Concrete families:

| Role | Family |
|---|---|
| Display/headings | `Plus Jakarta Sans` |
| Body/UI text | `Inter` |

CSS var fallback definitions:

| Variable | Value |
|---|---|
| `--font-display` | `var(--font-display), 'Plus Jakarta Sans', system-ui, sans-serif` |
| `--font-body` | `var(--font-body), 'Inter', system-ui, sans-serif` |

### Font sizes

Found in `globals.css`:

| Token | Value |
|---|---|
| `--font-size-xs` | `0.75rem` |
| `--font-size-sm` | `0.875rem` |
| `--font-size-base` | `1rem` |
| `--font-size-lg` | `1.125rem` |
| `--font-size-xl` | `1.25rem` |
| `--font-size-2xl` | `1.5rem` |
| `--font-size-3xl` | `1.875rem` |
| `--font-size-4xl` | `2.25rem` |
| `--font-size-5xl` | `3rem` |
| `--font-size-6xl` | `3.75rem` |
| `--font-size-7xl` | `4.5rem` |

### Line heights

| Token | Value |
|---|---|
| `--line-height-none` | `1` |
| `--line-height-tight` | `1.15` |
| `--line-height-snug` | `1.25` |
| `--line-height-normal` | `1.5` |
| `--line-height-relaxed` | `1.625` |
| `--line-height-loose` | `2` |

### Letter spacing

The utility layer references:
- `var(--tracking-tighter)`
- `var(--tracking-tight)`

These are clearly present in the token system, but their raw values were not included in the retrieved snippet, so I cannot quote them exactly.

### Spacing scale

No custom numeric spacing token table was found in retrieved files. The system appears to rely mostly on:
- Tailwind default spacing scale (`p-4`, `gap-6`, `px-8`, `mt-3`, etc.)
- Tailwind container padding (`2rem`)
- Some arbitrary values like `text-[10px]`, `max-w-[95vw]`

### Breakpoints

Explicitly found:

- Tailwind defaults are in use (`sm`, `md`, `lg`, `xl`, `2xl`)
- custom container screen:
  - `2xl: 1400px`

Project docs also map:
- base = mobile
- `md:` ≥ 768px
- `lg:` ≥ 1024px

from trip README:

```markdown
- Mobile (≤768px): single-column stacked layout.
- Tablet (769–1024px): two-column layout where possible (main content +
  sidebar/CTAs).
- Desktop (≥1025px): full-width grid with balanced spacing ...
- `md:` ≥768px → tablet two-column
- `lg:` ≥1024px → desktop
```

### Z-index scale

No centralized z-index token scale was found, but usage includes:
- `z-10`
- `z-20`
- `z-50`

Examples:
- calendar nav buttons: `z-10`
- day focus state: `focus-within:z-20`
- dialog overlay/content: `z-50`
- header: `z-50`
- nav dropdown: `z-50`

## Light/dark mode

Yes, light/dark/system support exists.

Mechanism:
- `next-themes` provider
- hook wrappers in `use-theme.ts`
- dark-state detection via `document.documentElement.classList.contains('dark')`

```typescript
export function isDarkMode(): boolean {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark')
  }
  return false
}
```

Toggle methods:
- `toggleTheme()`
- `setLightTheme()`
- `setDarkTheme()`
- `setSystemTheme()`

---

# 2. CSS Architecture

## Styling methodology

For the web app, the styling system is a **mix of**:

- **Tailwind CSS utility classes** as the dominant layer
- **CVA** for reusable component variant APIs
- **global CSS** for token definitions, utility classes, and custom animations
- **Radix primitives** wrapped with Tailwind classes
- **Framer Motion** for animated UI behavior


## Global CSS structure

Primary global stylesheet:

- `apps/web-tourist/src/app/globals.css`

This file contains:
- design tokens via CSS vars
- keyframes
- animation utility classes
- utility classes for typography

Evidence:

```css
@layer utilities {
  .font-display {
    font-family: var(--font-display);
  }

  .font-body {
    font-family: var(--font-body);
  }

  .text-display-xl {
    font-family: var(--font-display);
    font-size: var(--font-size-5xl);
    font-weight: 700;
    line-height: var(--line-height-tight);
    letter-spacing: var(--tracking-tighter);
  }
```

Imported once at root app layout:

```tsx
import './globals.css'
```

## Utility classes / custom utility layer

Yes. The repo defines custom utilities in `@layer utilities`, including:

- `.font-display`
- `.font-body`
- `.text-display-xl`
- `.text-display-lg`
- `.text-display-md`
- `.text-display-sm`
- animation helpers like:
  - `.animate-float`
  - `.animate-float-slow`
  - `.animate-float-fast`
  - `.animate-pulse-glow`
  - `.animate-draw-in`
  - `.animate-drift`
  - `.animate-spiral-in`
  - `.animate-page-enter`
  - `.animate-shimmer-sweep`
- `.chip-animate`
- `.dropdown-item-shimmer`

## CSS scoping

Both:
- **global** token/animation/utility layer in `globals.css`
- **per-component** utility composition in JSX via Tailwind and CVA

No CSS Modules surfaced in the retrieved frontend styling files.

---

# 3. Typography

## Font loading

Fonts are loaded with **`next/font/google`**.

```tsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
```

## Fonts used

| Family | Source | Weights seen |
|---|---|---|
| `Plus Jakarta Sans` | `next/font/google` | `500, 600, 700, 800` |
| `Inter` | `next/font/google` | not explicitly weight-limited in snippet; default variable font usage |

No local font files or `@font-face` were found in retrieved sources.

## Typographic hierarchy

The hierarchy is established through:
1. font-family split:
   - display vs body
2. tokenized size scale
3. custom utility classes
4. Tailwind weight/size classes in components

Examples of reusable hierarchy utilities:

```css
.text-display-xl {
  font-family: var(--font-display);
  font-size: var(--font-size-5xl);
  font-weight: 700;
  line-height: var(--line-height-tight);
  letter-spacing: var(--tracking-tighter);
}

.text-display-lg {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: var(--line-height-tight);
  letter-spacing: var(--tracking-tighter);
}

.text-display-md {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: 600;
  line-height: var(--line-height-snug);
  letter-spacing: var(--tracking-tight);
}
```

Common inline hierarchy patterns:
- headings: `text-lg font-bold`, `text-4xl font-bold tracking-tight`
- labels: `text-sm font-medium`
- captions/meta: `text-xs`, `text-[10px]`
- helper/error text: `text-sm`, often muted/destructive

## Reusable typography components/classes

Found:
- utility classes in global CSS
- `Label` component
- `FormLabel`, `FormDescription`, `FormMessage`

```tsx
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
)
```

---

# 4. Color Palette

## Semantic palette

### Primary semantic families defined
- primary
- secondary
- tertiary
- destructive
- success
- warning
- info
- muted
- accent
- card
- popover
- surface
- background
- foreground
- border
- input
- ring

## Concrete raw values found

### CSS variable values
Already confirmed:
- `0 0% 98%`
- `222.2 84% 4.9%`
- `210 40% 96%`
- `214.3 31.8% 91.4%`
- `275 85% 60%`

### Raw direct colors used in component classes
Found direct color classes / values include:

| Raw/utility color | Where |
|---|---|
| `bg-black/50` | dialog overlay |
| `bg-black/20` | dialog overlay blur |
| `bg-black/70` | dialog overlay dark |
| `text-white` | button gradient/glow |
| `border-white` | avatars, badges |
| `bg-white/20` | trip rating badge |
| `bg-white/15` | quick badges |
| `bg-green-500` | availability dot |
| `border-green-500` | input success |
| `focus-visible:ring-green-500` | input success |
| `border-yellow-500` | input warning |
| `focus-visible:ring-yellow-500` | input warning |
| `border-blue-500/50` | alert info |
| `text-blue-700` | alert info |
| `text-blue-600` | global error button |
| `hover:bg-blue-700` | global error button |
| `border-gray-300` | global error |
| `hover:bg-gray-50` | global error |
| `text-gray-600` | global error |
| `bg-amber-50` | guide rating pill |
| `text-amber-700` | guide rating pill |
| `fill-amber-400` / `text-amber-400` | stars |
| `bg-emerald-500` | verified badge |
| `text-emerald-600` | stat icon |
| `bg-gradient-to-r from-amber-50 to-orange-50` | booking alert |
| `text-amber-900` / `text-amber-700` | booking alert |
| `text-yellow-300` | trip rating star |

### Explicit RGBA value
Found in glow shadow:

```tsx
glow: 'bg-gradient-to-r from-primary via-secondary to-primary text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 animate-gradient bg-[length:200%_100%]',
```

So explicit raw value:
- `rgba(139,92,246,0.5)`

## Primary / secondary / neutral / semantic interpretation

### Primary
Token-driven; exact default HSL value not retrieved, but clearly central brand color.
Usage implies a purple/violet leaning identity because:
- `--ring: 275 85% 60%`
- glow shadow uses `rgba(139,92,246,0.5)` which is violet-purple
- gradients repeatedly combine primary/secondary for premium CTA surfaces

### Secondary
Token-driven; used in gradients and shimmer.

### Neutral
- `background`, `foreground`, `surface`, `muted`, `border`, `input`, `card`
- light palette leans soft gray/off-white

### Semantic
- destructive
- success
- warning
- info
with both tokenized and ad hoc utility usage

## Gradients

Found gradient patterns:

| Gradient | Usage |
|---|---|
| `bg-gradient-to-r from-primary to-secondary` | gradient button |
| `bg-gradient-to-r from-primary via-secondary to-primary` | glow button |
| `bg-gradient-to-br from-primary/20 to-primary/5` | avatar halo |
| `bg-gradient-to-b from-primary/5 to-transparent` | guide stat tile |
| `bg-gradient-to-b from-emerald-500/5 to-transparent` | guide stat tile |
| `bg-gradient-to-b from-blue-500/5 to-transparent` | guide stat tile |
| `bg-gradient-to-r from-amber-50 to-orange-50` | booking alert |
| `bg-gradient-to-r from-transparent via-white/10 to-transparent` | shimmer overlay |
| `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)` | dropdown shimmer |
| `linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.15) 25%, hsl(var(--secondary) / 0.2) 50%, ... )` | shimmer sweep |

Theme utility helper also generates gradients programmatically:

```typescript
export function getGradientBackground(
  startColor: string,
  endColor: string,
  direction: 'to-r' | 'to-br' | 'to-b' | 'to-bl' = 'to-r',
): string {
...
  return `linear-gradient(${directionMap[direction]}, ${startColor}, ${endColor})`
}
```

---

# 5. Component Aesthetics

I’ll cover the shared UI primitives that were actually retrieved.

## Button

Source: `src/components/ui/button.tsx`

### Base style
- inline flex
- centered content
- rounded
- medium weight
- GPU transform
- slight hover lift
- active press shrink
- focus styles shared globally
- disabled opacity + pointer lock

Shared base config:

```typescript
export const BASE_INTERACTIVE_CLASSES = [
  'inline-flex',
  'items-center',
  'justify-center',
  'whitespace-nowrap',
  'rounded-md',
  'text-sm',
  'font-medium',
  'transform-gpu',
  'hover:-translate-y-0.5',
  'active:translate-y-0',
  'active:scale-[0.98]',
...
  'disabled:pointer-events-none',
  'disabled:opacity-50',
].join(' ')
```

### Variants

| Variant | Visual style |
|---|---|
| `default` | solid primary background, primary foreground |
| `destructive` | solid destructive |
| `outline` | bordered, background fill, accent hover |
| `secondary` | solid secondary |
| `ghost` | transparent with accent hover |
| `link` | text-only link styling |
| `gradient` | left-to-right primary→secondary gradient, white text, shadow |
| `pill` | rounded-full, shadowed primary button |
| `glow` | animated gradient, white text, bright purple glow shadow |

### Sizes

| Size | Classes |
|---|---|
| `default` | `h-10 px-4 py-2` |
| `sm` | `h-9 rounded-md px-3` |
| `lg` | `h-11 rounded-md px-8` |
| `icon` | `h-10 w-10` |

### States
- **hover:** scale `1.02`, often color shift or stronger shadow
- **tap/active:** scale `0.95` on motion button, plus shared active scale `0.98`
- **loading:** crossfade to spinner + text
- **disabled:** opacity reduced, pointer-events none
- **focus:** shared focus ring classes from config
- **animated transitions:** spring stiffness `400`, damping `17`

## Input

Source: `src/components/ui/input.tsx`

### Visual style
- bordered input
- size variants
- optional left/right icon slots
- inline label, helper, error message
- semantic border/focus change by variant

### Variants

| Variant | Visual style |
|---|---|
| `default` | `border-input` |
| `error` | `border-destructive focus-visible:ring-destructive` |
| `success` | `border-green-500 focus-visible:ring-green-500` |
| `warning` | `border-yellow-500 focus-visible:ring-yellow-500` |

### Sizes

| Size | Classes |
|---|---|
| `default` | `h-10 px-3 py-2` |
| `sm` | `h-9 px-3 text-xs` |
| `lg` | `h-11 px-4 text-base` |

### States
- error text in destructive
- helper text muted
- disabled respected
- icon padding adds `pl-10` or `pr-10`

## Dialog

Source: `src/components/ui/dialog.tsx`

### Overlay variants
| Variant | Style |
|---|---|
| `default` | `bg-black/50` |
| `blur` | `bg-black/20 backdrop-blur-md` |
| `dark` | `bg-black/70` |

### Content style
- fixed centered modal
- border + `bg-background`
- `shadow-lg`
- `p-6`
- max width variants
- animated in/out with fade/zoom/slide
- `sm:rounded-lg`

### Sizes
| Size | Class |
|---|---|
| `sm` | `max-w-sm` |
| `default` | `max-w-lg` |
| `lg` | `max-w-2xl` |
| `xl` | `max-w-4xl` |
| `full` | `max-w-[95vw] max-h-[95vh]` |

### States
- open/closed handled with `data-[state=...]`
- click outside closes
- ESC closes
- overlay and content animate independently

## Tooltip

Source: `src/components/ui/tooltip.tsx`

### Visual style
- primary colored background
- primary foreground text
- rounded-md
- small text `text-xs`
- compact padding `px-3 py-1.5`
- overflow hidden
- fade + zoom + directional slide animation

## Checkbox

Source: `src/components/ui/checkbox.tsx`

### Style
- small square checkbox `h-4 w-4`
- rounded-sm
- `border-primary`
- checked state: `bg-primary text-primary-foreground`
- focus ring via `ring-ring`
- disabled opacity

## Avatar

Source: `src/components/ui/avatar.tsx`

### Style
- circular (`rounded-full`)
- overflow-hidden
- default size `h-10 w-10`
- fallback uses muted background

Consumer examples show more elaborate avatar styling:
- `h-16 w-16 border-2 border-white shadow-md`
- decorative halo gradients
- verification badge overlays

## Alert

Source: `src/components/ui/alert.tsx`

### Base style
- rounded-lg border
- `p-4`
- small text
- icon offset layout pattern

### Variants
| Variant | Visual treatment |
|---|---|
| `default` | background/foreground semantic |
| `destructive` | destructive border/text |
| `success` | green border/text |
| `warning` | yellow border/text |
| `info` | blue border/text |

## Skeleton

Source: `src/components/ui/skeleton.tsx`

### Style
- muted background
- `animate-pulse`
- rounded-md

Plus page-specific skeletons add shimmer overlays and staggered delays.

## Calendar

Source: `src/components/ui/calendar.tsx`

### Style
- padded container
- responsive month layout (`sm:flex-row`)
- navigation buttons reuse outline button variant
- selected days use primary fill
- today uses accent
- outside/disabled days use muted opacity
- range edges rounded left/right

---

# 6. Layout & Spacing System

## Grid/layout system

The app uses:
- Tailwind flexbox
- Tailwind CSS grid
- Tailwind container utility
- sticky positioned shell elements
- App Router section-based page composition

Examples:
- `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- `flex items-center justify-between`
- `sticky top-0`
- `sticky top-16`

## Container system

Tailwind container is configured to:
- center content
- `padding: 2rem`
- `2xl: 1400px`

```typescript
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px',
  },
},
```

Usage:
- `container mx-auto px-4`

This suggests a mixed strategy: Tailwind `container` plus page-level extra padding controls.

## Spacing application

Mostly Tailwind scale-based:
- `p-6`, `p-4`, `px-8`, `py-16`, `gap-4`, `space-y-4`, `mb-12`

Also arbitrary values:
- `text-[10px]`
- `max-w-[95vw]`
- `top-[48%]`
- `slide-in-from-top-[48%]`

## Layout wrappers/components

Found:
- `HeaderLayout`
- dashboard sidebar
- conditional header/footer
- page sections
- `SectionDivider`

`HeaderLayout` enforces sticky translucent header shell.

```tsx
<header
  className={cn(
    'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur',
    className,
  )}
>
```

---

# 7. Animations & Transitions

This codebase is notably animation-heavy. It uses **both CSS keyframes** and **Framer Motion**.

## Animation libraries used
- **Framer Motion**
- **tailwindcss-animate**
- custom CSS keyframes in `globals.css`

Tech stack doc confirms Tailwind + CVA; code confirms Framer Motion is actively used.

## Keyframes found

From retrieved `globals.css` snippets:

| Keyframes | Purpose |
|---|---|
| `chip-enter` | chip appearance |
| `float` | drifting particles |
| `pulse-glow` | glowing CTA pulse |
| `draw-in` | SVG stroke reveal |
| `drift-x` | horizontal particle wandering |
| `spiral-in` | center entrance |
| `page-enter` | page/section fade+lift+deblur |
| `shimmer-sweep` | premium shimmer sweep |
| `dropdown-shimmer` | nav hover sheen |

### Examples

```css
@keyframes chip-enter { ... }
@keyframes float { ... }
@keyframes pulse-glow { ... }
@keyframes draw-in { ... }
@keyframes drift-x { ... }
```

```css
@keyframes spiral-in { ... }
@keyframes page-enter { ... }
@keyframes shimmer-sweep { ... }
@keyframes dropdown-shimmer { ... }
```

## Animation classes found

| Class | Behavior |
|---|---|
| `.chip-animate` | `chip-enter 0.2s ease-out forwards` |
| `.animate-float` | `float 6s ease-in-out infinite` |
| `.animate-float-slow` | `float 10s ease-in-out infinite` |
| `.animate-float-fast` | `float 4s ease-in-out infinite` |
| `.animate-pulse-glow` | `pulse-glow 2.5s ease-in-out infinite` |
| `.animate-draw-in` | `draw-in 2s ease-out forwards` |
| `.animate-drift` | `drift-x 15s ease-in-out infinite` |
| `.animate-spiral-in` | `spiral-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` |
| `.animate-page-enter` | `page-enter 0.4s ease-out forwards` |
| `.animate-shimmer-sweep` | `shimmer-sweep 2s linear infinite` |

## Transition properties found

### CSS transitions
- `transition: opacity 0.2s`
- component classes using `transition-all`, `transition-colors`, `duration-200`, `duration-300`
- motion-reduced variants disabling transitions

### Framer Motion examples

#### Button
- hover scale `1.02`
- tap scale `0.95`
- spring `{ stiffness: 400, damping: 17 }`
- loading/content crossfade `duration: 0.2`

#### Dropdown
- panel open: spring, stagger children
- close: `duration: 0.15, ease: 'easeOut'`
- chevron rotate with spring

#### Sidebar
- width spring animation
- label reveal/hide
- item stagger by index
- card collapse/expand

#### Motion utility components
From `src/components/ui/motion.tsx`:
- reveal on in-view
- default distance-based fade up
- staggered lists
- scale-in grids
- reduced-motion fallback

```tsx
initial={{ opacity: 0, y: distance }}
whileInView={{ opacity: 1, y: 0 }}
transition={{
  duration: 0.35,
  ease: 'easeOut',
  delay,
}}
```

## Route/page transitions

Yes, at least via CSS utility `.animate-page-enter`, labeled in file comments as:

- “Page Transitions - Smooth route changes”

Whether every route actually uses it is not fully proven from retrieved files, but the primitive exists.

## Trigger types

| Trigger | Present? | Examples |
|---|---|---|
| Hover | Yes | button, nav dropdown items, trip buttons, guide image zoom |
| Tap/active | Yes | motion buttons, booking date buttons |
| Scroll/in-view | Yes | motion reveal components using `whileInView` and `useInView` |
| Mount/unmount | Yes | AnimatePresence in buttons, dialogs, sidebars |
| Loading state | Yes | spinner, skeleton shimmer |
| Reduced motion respect | Yes | extensive `prefers-reduced-motion` handling |

---

# 8. Icons & Graphics

## Icon library/system

Main icon library found:
- **Lucide React**

Examples:
- `Check`
- `CheckCircle`
- `ChevronDown`
- `ChevronLeft`
- `Star`
- `Users`
- `Calendar`
- `Clock`
- `Briefcase`
- `Languages`
- `Building2`
- `Zap`
- `AlertCircle`

Next config also optimizes imports for:
- `lucide-react`
- `@radix-ui/react-icons`

```typescript
experimental: {
  optimizeCss: false,
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
},
```

## How icons are consumed
As **React components** directly in JSX, styled with Tailwind classes:
- `className='h-4 w-4'`
- `fill-amber-400 text-amber-400`
- `text-primary`

## Illustrations / custom graphics

Evidence suggests custom image assets exist, including:
- public images like `/images/discover-hero.jpg`
- 3D icon assets under `apps/web-tourist/public/assets/icons/3d`

## Image handling

The web app uses **Next.js image optimization**:

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30,
  dangerouslyAllowSVG: true,
```

This implies:
- AVIF/WebP optimization
- responsive image sizing
- long cache TTL
- allowed external domains: Unsplash, placeholder images
- `next/image` is used in components like `GuideCard`

---

# 9. Shadows, Borders & Depth

## Shadows found

### Tokenized shadows
- `--shadow-sm`
- `--shadow`
- `--shadow-md`
- `--shadow-lg`
- `--shadow-xl`

### Raw/utility shadow classes
- `shadow-sm`
- `shadow-md`
- `shadow-lg`
- `hover:shadow-lg`
- `hover:shadow-xl`

### Explicit box-shadow values in CSS animations
From pulse-glow:

```css
box-shadow:
  0 0 20px hsl(var(--primary) / 0.3),
  0 0 40px hsl(var(--primary) / 0.1);
...
box-shadow:
  0 0 30px hsl(var(--primary) / 0.5),
  0 0 60px hsl(var(--primary) / 0.2),
  0 0 90px hsl(var(--secondary) / 0.1);
```

### Explicit arbitrary shadow
- `hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]`

## Borders found

Common styles:
- `border`
- `border-2`
- `border-r`
- `border-b`
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

Semantic border colors:
- `border-input`
- `border-border`
- `border-destructive`
- `border-amber-200`
- `border-gray-300`
- `border-muted`
- `border-white`

## Depth/layering language

Depth is conveyed through:
- layered shadows
- translucent backgrounds + backdrop blur
- floating cards with hover lift
- sticky headers/sidebar
- overlays at `z-50`
- halos and glows around avatars/CTAs
- gradients fading to transparent
- modal blur scrims

This is much more “premium glassy elevation” than flat minimalism.

---

# 10. Responsiveness & Adaptive Design

## Breakpoints defined/used

Found:
- `sm`
- `md`
- `lg`
- `xl`
- `2xl`

Explicit custom container breakpoint:
- `2xl: 1400px`

Usage examples:
- `sm:flex-row`
- `md:grid-cols-2`
- `lg:grid-cols-3`
- `xl:grid-cols-4`
- `sm:block`
- `lg:px-6`

## Responsive implementation

Implemented through:
- Tailwind responsive prefixes
- responsive grid columns
- responsive flex direction changes
- responsive visibility (`hidden sm:block`)
- container width changes

No container queries found in retrieved files.

## Mobile-specific/layout changes

Yes:
- page grids collapse to single-column
- header logo text hidden on small screens
- calendar months stack vertically on small screens
- trip README explicitly documents mobile/tablet/desktop layout expectations

Example:

```tsx
<span className='hidden text-lg font-bold sm:block'>{tenantName}</span>
```

---

# 11. Third-Party UI Libraries

## Web app

### Tailwind CSS
Primary styling engine.

### class-variance-authority (CVA)
Used to define variant APIs for components:
- button
- input
- alert
- label
- dialog overlay/content

### Radix UI primitives
Used in:
- label
- tooltip
- checkbox
- avatar

These are customized with Tailwind classes rather than themed through a separate theme object.

### next-themes
Theme persistence and switching.

### Framer Motion
Major source of interaction polish and animated layout.

### tailwindcss-animate
Used to support animation utility patterns like `animate-in`, `fade-in-0`, `zoom-in-95`, etc.

### react-day-picker
Calendar rendering, fully reskinned with Tailwind class overrides.

## Mobile app

The mobile app uses a separate stack:
- **NativeWind**
- Tailwind token colors mapped to CSS-like variables for RN
- Expo / React Native environment

Evidence:

```javascript
presets: [require('nativewind/preset')],
```

This means the repo has **two design systems sharing a token philosophy**, but implemented separately:
- web: Tailwind + CSS vars + Next themes
- mobile: NativeWind + RGB variable tokens

---

# 12. Overall Aesthetic Summary

The Isla web app presents a **premium, travel-lifestyle UI language** built on a modern utility-first system but dressed with much more flourish than a typical SaaS dashboard. Its foundation is semantic and disciplined—tokenized colors, radii, shadows, and typography—but the expression is notably richer: soft gradients, blurred overlays, glowing CTAs, shimmer effects, floating particles, animated reveals, and spring-based microinteractions. The typography pairing of **Plus Jakarta Sans** for display and **Inter** for body gives it a polished editorial-commercial feel: upscale, friendly, and contemporary rather than corporate or austere. Visually, it leans toward a **“premium soft-tech / aspirational marketplace”** aesthetic—somewhere between modern travel branding, luxury booking UI, and high-end startup marketing. Cards are rounded and elevated, interface chrome is translucent in places, and motion is used to suggest delight and confidence rather than raw utility. A designer would likely describe the look as **modern premium travel UI with glassy accents, semantic theming, and animated marketplace polish**—not fully glassmorphic, not brutalist, not minimalist, but a carefully embellished, conversion-oriented experience.

---

# Tailwind Config Deep Dive

```typescript
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
        },
...
```

---

# 1. What this confirms about the design system

This file proves the web app has a **formal semantic design-token bridge** between:

- **CSS custom properties** in `globals.css`
- **Tailwind theme extensions**
- **component usage via semantic utility classes**

In other words, this is not just “Tailwind with ad hoc colors.” It is a **tokenized design system** with Tailwind as the consumption layer.

The major categories of tokens exposed to Tailwind are:

- colors
- radii
- shadows
- font sizes
- line heights
- z-index
- font families
- letter spacing
- keyframes / animations

That is a real, intentional theming architecture.

---

# 2. Full token surface exposed by Tailwind

## Colors

### Base semantic colors
| Token |
|---|
| `border` |
| `input` |
| `ring` |
| `background` |
| `foreground` |

### Brand / emphasis colors
| Token | Subtokens |
|---|---|
| `primary` | `DEFAULT`, `foreground`, `hover`, `active` |
| `secondary` | `DEFAULT`, `foreground`, `hover`, `active` |
| `tertiary` | `DEFAULT`, `foreground`, `hover`, `active` |

### Semantic state colors
| Token | Subtokens |
|---|---|
| `destructive` | `DEFAULT`, `foreground` |
| `success` | `DEFAULT`, `foreground` |
| `warning` | `DEFAULT`, `foreground` |
| `info` | `DEFAULT`, `foreground` |

### Supporting UI colors
| Token | Subtokens |
|---|---|
| `muted` | `DEFAULT`, `foreground` |
| `accent` | `DEFAULT`, `foreground` |
| `popover` | `DEFAULT`, `foreground` |
| `card` | `DEFAULT`, `foreground` |
| `surface` | `DEFAULT`, `foreground`, `hover` |

## Border radius scale

| Tailwind token | CSS variable |
|---|---|
| `rounded-sm` | `--radius-sm` |
| `rounded` / default | `--radius` |
| `rounded-md` | `--radius-md` |
| `rounded-lg` | `--radius-lg` |
| `rounded-xl` | `--radius-xl` |

## Shadow scale

| Tailwind token | CSS variable |
|---|---|
| `shadow-sm` | `--shadow-sm` |
| `shadow` | `--shadow` |
| `shadow-md` | `--shadow-md` |
| `shadow-lg` | `--shadow-lg` |
| `shadow-xl` | `--shadow-xl` |

## Font size scale

| Tailwind token | CSS variable |
|---|---|
| `text-xs` | `--font-size-xs` |
| `text-sm` | `--font-size-sm` |
| `text-base` | `--font-size-base` |
| `text-lg` | `--font-size-lg` |
| `text-xl` | `--font-size-xl` |
| `text-2xl` | `--font-size-2xl` |
| `text-3xl` | `--font-size-3xl` |
| `text-4xl` | `--font-size-4xl` |
| `text-5xl` | `--font-size-5xl` |
| `text-6xl` | `--font-size-6xl` |
| `text-7xl` | `--font-size-7xl` |

## Line height scale

| Tailwind token | CSS variable |
|---|---|
| `leading-none` | `--line-height-none` |
| `leading-tight` | `--line-height-tight` |
| `leading-snug` | `--line-height-snug` |
| `leading-normal` | `--line-height-normal` |
| `leading-relaxed` | `--line-height-relaxed` |
| `leading-loose` | `--line-height-loose` |

## Z-index scale

This is a significant addition not previously confirmed.

| Tailwind token | CSS variable |
|---|---|
| `z-dropdown` | `--z-dropdown` |
| `z-sticky` | `--z-sticky` |
| `z-fixed` | `--z-fixed` |
| `z-modal-backdrop` | `--z-modal-backdrop` |
| `z-modal` | `--z-modal` |
| `z-popover` | `--z-popover` |
| `z-tooltip` | `--z-tooltip` |
| `z-toast` | `--z-toast` |

This means the app has a **named layering system**, not just scattered `z-10/z-50`.

## Font families

| Tailwind token | Stack |
|---|---|
| `font-display` | `var(--font-display), 'Plus Jakarta Sans', system-ui, sans-serif` |
| `font-body` | `var(--font-body), 'Inter', system-ui, sans-serif` |
| `font-sans` | `var(--font-body), 'Inter', system-ui, sans-serif` |
| `font-mono` | `var(--font-mono), monospace` |

This also newly confirms a **mono token** exists in the broader system, even though I haven’t yet seen where `--font-mono` is defined.

## Letter spacing scale

Another major addition.

| Tailwind token | CSS variable |
|---|---|
| `tracking-tighter` | `--tracking-tighter` |
| `tracking-tight` | `--tracking-tight` |
| `tracking-normal` | `--tracking-normal` |
| `tracking-wide` | `--tracking-wide` |
| `tracking-wider` | `--tracking-wider` |
| `tracking-widest` | `--tracking-widest` |

This confirms the typography system is more complete than the first pass could prove.

---

# 3. Breakpoints and layout system

This file confirms:

## Container behavior
```typescript
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px',
  },
},
```

### What that means
- content is centered automatically with Tailwind’s `container`
- global horizontal gutter at container level is `2rem`
- the maximum designed “large desktop” content width is **1400px at `2xl`**

This is a classic premium app/marketing-site setup: broad but controlled layouts.

---

# 4. Animation system confirmed by Tailwind config

This file adds **Tailwind-native animation tokens** beyond the custom CSS keyframes in `globals.css`.

## Keyframes defined
| Keyframe | From | To |
|---|---|---|
| `accordion-down` | `height: 0` | `height: var(--radix-accordion-content-height)` |
| `accordion-up` | `height: var(--radix-accordion-content-height)` | `height: 0` |

## Animation utilities
| Tailwind animation token | Value |
|---|---|
| `animate-accordion-down` | `accordion-down 0.2s ease-out` |
| `animate-accordion-up` | `accordion-up 0.2s ease-out` |

This strongly suggests accordion/disclosure UI is expected, likely based on Radix patterns or shadcn-style component conventions.

## Plugin
```typescript
plugins: [tailwindcssAnimate],
```

That confirms utility classes like:
- `animate-in`
- `animate-out`
- `fade-in-*`
- `fade-out-*`
- `zoom-in-*`
- `zoom-out-*`
- `slide-in-*`
- `slide-out-*`

are intentionally part of the design system, not accidental one-offs.

---

# 5. What this changes in the earlier conclusions

## Correction: z-index is definitely tokenized
Earlier I said a centralized z-index scale was not fully confirmed. This file proves it **is**.

The app has a named z-index system:
- dropdown
- sticky
- fixed
- modal-backdrop
- modal
- popover
- tooltip
- toast

That is a mature layering model.

## Correction: typography tokens are more complete
The earlier pass only confirmed some font sizes and hinted at tracking variables. This file proves the typography system includes:
- family tokens
- size tokens
- line-height tokens
- letter-spacing tokens
- mono font support

## Correction: animation architecture is dual-layer
The app doesn’t just use custom CSS animations and Framer Motion. It also has:
- Tailwind animation plugin utilities
- Tailwind-defined named keyframes

So the true stack is:

1. **Framer Motion** for interactive/stateful animation
2. **tailwindcss-animate** for utility-driven enter/exit transitions
3. **custom CSS keyframes** for decorative brand motion

That is a three-layer animation strategy.

---

# 6. Inferred design maturity from this file

This config indicates a **deliberately systematized frontend**, because it includes:

- semantic naming instead of raw palette names
- stateful subtokens like `hover` and `active`
- typography beyond basic size mapping
- layered z-index semantics
- tokenized radii and shadows
- component-ready animation hooks

This is the kind of config you see when a team wants:
- theme portability
- consistent component APIs
- easier light/dark adaptation
- scalable UI primitives

It is much closer to a **design-token pipeline** than a casual Tailwind setup.

---

# 8. Most important additions to the previous report

If I were updating the original 12-section report with this file, I would explicitly add:

## Under Design System & Theming
- The design system includes **tokenized z-index** and **tokenized letter spacing**
- `font-mono` support exists in theme config
- colors include hover/active subtokens for primary/secondary/tertiary

## Under Typography
- full letter-spacing scale exists:
  - tighter
  - tight
  - normal
  - wide
  - wider
  - widest

## Under Layout & Spacing
- container is centered with `2rem` padding and `2xl = 1400px`

## Under Animations
- Tailwind config defines:
  - `accordion-down`
  - `accordion-up`
- plugin `tailwindcss-animate` is officially part of the stack

## Under Shadows, Borders & Depth
- shadow scale is formally tokenized in Tailwind, not merely incidental CSS vars

---

# 9. Concise revised summary of the styling architecture

The web app uses a **semantic Tailwind design system backed by CSS variables**, with **next-themes** for dark/light/system mode, **CVA** for reusable component variants, **Radix UI primitives** for accessible foundations, **Framer Motion** for rich interaction animation, and **tailwindcss-animate** for enter/exit transitions. The Tailwind config exposes a full token layer covering **colors, radii, shadows, typography, letter spacing, z-index, and animation**. This is a structured, production-grade theming system rather than a loose Tailwind codebase.

---

# 1. Exhaustive token matrix from `globals.css`

## 1A. Color token matrix

From `:root` in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  --primary: 275 85% 60%;
  --primary-foreground: 0 0% 100%;
  --primary-hover: 275 85% 55%;
  --primary-active: 275 85% 50%;

  --secondary: 27 95% 58%;
  --secondary-foreground: 0 0% 100%;
  --secondary-hover: 27 95% 53%;
  --secondary-active: 27 95% 48%;

  --tertiary: 145 70% 48%;
  --tertiary-foreground: 0 0% 100%;
  --tertiary-hover: 145 70% 43%;
  --tertiary-active: 145 70% 38%;

  --success: 145 70% 48%;
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --info: 275 85% 60%;
  --info-foreground: 0 0% 100%;

  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;

  --surface: 0 0% 98%;
  --surface-foreground: 222.2 84% 4.9%;
  --surface-hover: 210 40% 96%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 275 85% 60%;
}
```

## Color token table

| Category | Token | Value | Notes |
|---|---|---:|---|
| Base | `--background` | `0 0% 100%` | white background |
| Base | `--foreground` | `222.2 84% 4.9%` | dark text |
| Surface | `--card` | `0 0% 100%` | white card |
| Surface | `--card-foreground` | `222.2 84% 4.9%` | card text |
| Surface | `--popover` | `0 0% 100%` | popover background |
| Surface | `--popover-foreground` | `222.2 84% 4.9%` | popover text |
| Brand | `--primary` | `275 85% 60%` | distinctive purple |
| Brand | `--primary-foreground` | `0 0% 100%` | white on purple |
| Brand | `--primary-hover` | `275 85% 55%` | darker hover purple |
| Brand | `--primary-active` | `275 85% 50%` | darker active purple |
| Brand | `--secondary` | `27 95% 58%` | vibrant orange |
| Brand | `--secondary-foreground` | `0 0% 100%` | white on orange |
| Brand | `--secondary-hover` | `27 95% 53%` | darker orange |
| Brand | `--secondary-active` | `27 95% 48%` | darker active orange |
| Brand | `--tertiary` | `145 70% 48%` | green accent |
| Brand | `--tertiary-foreground` | `0 0% 100%` | white on green |
| Brand | `--tertiary-hover` | `145 70% 43%` | darker green |
| Brand | `--tertiary-active` | `145 70% 38%` | darker active green |
| Semantic | `--success` | `145 70% 48%` | same as tertiary |
| Semantic | `--success-foreground` | `0 0% 100%` | white |
| Semantic | `--warning` | `38 92% 50%` | amber/yellow |
| Semantic | `--warning-foreground` | `0 0% 100%` | white |
| Semantic | `--destructive` | `0 84.2% 60.2%` | red |
| Semantic | `--destructive-foreground` | `0 0% 100%` | white |
| Semantic | `--info` | `275 85% 60%` | same as primary |
| Semantic | `--info-foreground` | `0 0% 100%` | white |
| Neutral | `--muted` | `210 40% 96%` | soft gray |
| Neutral | `--muted-foreground` | `215.4 16.3% 46.9%` | medium gray text |
| Neutral | `--accent` | `210 40% 96%` | accent fill |
| Neutral | `--accent-foreground` | `222.2 84% 4.9%` | accent text |
| Surface | `--surface` | `0 0% 98%` | off-white layer |
| Surface | `--surface-foreground` | `222.2 84% 4.9%` | dark text |
| Surface | `--surface-hover` | `210 40% 96%` | hover state |
| Stroke | `--border` | `214.3 31.8% 91.4%` | light border |
| Stroke | `--input` | `214.3 31.8% 91.4%` | input border |
| Focus | `--ring` | `275 85% 60%` | same as primary |

## Palette interpretation

### Primary palette
Purple:
- `--primary`
- `--primary-hover`
- `--primary-active`

### Secondary palette
Orange:
- `--secondary`
- `--secondary-hover`
- `--secondary-active`

### Tertiary palette
Green:
- `--tertiary`
- `--tertiary-hover`
- `--tertiary-active`

### Semantic overlap
There is intentional palette reuse:
- `success` == `tertiary`
- `info` == `primary`

So semantically distinct tokens do not always map to distinct hues.

---

## 1B. Typography token matrix

```css
--font-display: var(--font-display), 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body: var(--font-body), 'Inter', system-ui, sans-serif;

--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
--font-size-5xl: 3rem;
--font-size-6xl: 3.75rem;
--font-size-7xl: 4.5rem;

--line-height-none: 1;
--line-height-tight: 1.15;
--line-height-snug: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;

--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

## Typography token table

| Type | Token | Value |
|---|---|---:|
| Font family | `--font-display` | `var(--font-display), 'Plus Jakarta Sans', system-ui, sans-serif` |
| Font family | `--font-body` | `var(--font-body), 'Inter', system-ui, sans-serif` |
| Font size | `--font-size-xs` | `0.75rem` |
| Font size | `--font-size-sm` | `0.875rem` |
| Font size | `--font-size-base` | `1rem` |
| Font size | `--font-size-lg` | `1.125rem` |
| Font size | `--font-size-xl` | `1.25rem` |
| Font size | `--font-size-2xl` | `1.5rem` |
| Font size | `--font-size-3xl` | `1.875rem` |
| Font size | `--font-size-4xl` | `2.25rem` |
| Font size | `--font-size-5xl` | `3rem` |
| Font size | `--font-size-6xl` | `3.75rem` |
| Font size | `--font-size-7xl` | `4.5rem` |
| Line height | `--line-height-none` | `1` |
| Line height | `--line-height-tight` | `1.15` |
| Line height | `--line-height-snug` | `1.25` |
| Line height | `--line-height-normal` | `1.5` |
| Line height | `--line-height-relaxed` | `1.625` |
| Line height | `--line-height-loose` | `2` |
| Tracking | `--tracking-tighter` | `-0.05em` |
| Tracking | `--tracking-tight` | `-0.025em` |
| Tracking | `--tracking-normal` | `0` |
| Tracking | `--tracking-wide` | `0.025em` |
| Tracking | `--tracking-wider` | `0.05em` |
| Tracking | `--tracking-widest` | `0.1em` |

---

## 1C. Shape, depth, and layering tokens

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

--radius: 0.5rem;
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

## Shape/depth table

| Type | Token | Value |
|---|---|---|
| Shadow | `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| Shadow | `--shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` |
| Shadow | `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| Shadow | `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| Shadow | `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` |
| Radius | `--radius-sm` | `0.25rem` |
| Radius | `--radius` | `0.5rem` |
| Radius | `--radius-md` | `0.375rem` |
| Radius | `--radius-lg` | `0.75rem` |
| Radius | `--radius-xl` | `1rem` |

## Z-index table

```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

| Token | Value |
|---|---:|
| `--z-dropdown` | `1000` |
| `--z-sticky` | `1020` |
| `--z-fixed` | `1030` |
| `--z-modal-backdrop` | `1040` |
| `--z-modal` | `1050` |
| `--z-popover` | `1060` |
| `--z-tooltip` | `1070` |
| `--z-toast` | `1080` |

---

# 2. Global base styling matrix

## Base reset/application rules

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
  }
...
}
```

## Base style summary

| Selector | Styling |
|---|---|
| `*` | all elements get `border-border` |
| `body` | `bg-background text-foreground` + body font |
| `h1-h6` | display font, weight 600, tracking-tight, line-height-tight |
| `h1` | 4xl → 5xl at `768px` → 6xl at `1024px`, weight 700, tracking-tighter |
| `h2` | 3xl → 4xl at `768px`, weight 700 |
| `h3` | 2xl → 3xl at `768px` |
| `h4` | xl |
| `h5` | lg |
| `h6` | base |
| `p, li, dd` | line-height-normal |
| `article p` | line-height-relaxed |

This means typography is not solely utility-driven; there is a meaningful base typographic opinion in CSS.

---

# 3. Global utility / animation matrix

## 3A. Utility classes defined in `globals.css`

### Typography utilities
```css
.font-display { ... }
.font-body { ... }
.text-display-xl { ... }
.text-display-lg { ... }
.text-display-md { ... }
.text-display-sm { ... }
.md\:text-display-xl { ... }
.md\:text-display-lg { ... }
.lg\:text-display-xl { ... }
.tracking-tighter { ... }
.tracking-tight { ... }
.tracking-normal { ... }
.tracking-wide { ... }
.tracking-wider { ... }
.tracking-widest { ... }
.cta-glow { ... }
.text-gradient-primary { ... }
```

### Utility table

| Utility | Purpose | Actual behavior |
|---|---|---|
| `.font-display` | display typography | applies `var(--font-display)` |
| `.font-body` | body typography | applies `var(--font-body)` |
| `.text-display-xl` | hero heading | 5xl, 700, tight line-height, tighter tracking |
| `.text-display-lg` | large heading | 4xl, 700 |
| `.text-display-md` | medium heading | 3xl, 600 |
| `.text-display-sm` | smaller heading | 2xl, 600 |
| `.md:text-display-xl` | tablet+ hero heading | 6xl |
| `.md:text-display-lg` | tablet+ large heading | 5xl |
| `.lg:text-display-xl` | desktop hero heading | 7xl |
| `.tracking-tighter` | large display tracking | `-0.05em` |
| `.tracking-tight` | heading tracking | `-0.025em` |
| `.tracking-normal` | body tracking | `0` |
| `.tracking-wide` | label tracking | `0.025em` |
| `.tracking-wider` | button/all-caps style | `0.05em` |
| `.tracking-widest` | extreme label spacing | `0.1em` |
| `.cta-glow` | CTA depth/glow | multi-shadow primary glow |
| `.text-gradient-primary` | gradient text | primary→secondary text fill |

## 3B. Animation classes and keyframes

### Keyframes defined
| Keyframes | Duration/use class | Behavior |
|---|---|---|
| `ken-burns` | `.animate-ken-burns` | zoom/pan image |
| `shimmer` | `.shimmer`, `.shimmer-effect` | skeleton shimmer sweep |
| `gradient` | `.animate-gradient` | animated gradient position |
| `chip-enter` | `.chip-animate` | scale/opacity entrance |
| `float` | `.animate-float*` | drifting particles |
| `pulse-glow` | `.animate-pulse-glow` | CTA glow pulse |
| `draw-in` | `.animate-draw-in` | SVG stroke draw |
| `drift-x` | `.animate-drift` | horizontal wander |
| `spiral-in` | `.animate-spiral-in` | spin/scale entrance |
| `page-enter` | `.animate-page-enter` | fade + lift + deblur |
| `shimmer-sweep` | `.animate-shimmer-sweep` | premium gradient sweep |
| `dropdown-shimmer` | `.dropdown-item-shimmer:hover::before` | nav shimmer overlay |

### Animation utility table

| Class | Value |
|---|---|
| `.animate-ken-burns` | `ken-burns 12s ease-out forwards` |
| `.shimmer` | `shimmer 1.5s ease-in-out infinite` |
| `.shimmer-effect` | `shimmer 1.5s ease-in-out infinite` |
| `.animate-gradient` | `gradient 3s ease-in-out infinite` |
| `.chip-animate` | `chip-enter 0.2s ease-out forwards` |
| `.animate-float` | `float 6s ease-in-out infinite` |
| `.animate-float-slow` | `float 10s ease-in-out infinite` |
| `.animate-float-fast` | `float 4s ease-in-out infinite` |
| `.animate-pulse-glow` | `pulse-glow 2.5s ease-in-out infinite` |
| `.animate-draw-in` | `draw-in 2s ease-out forwards` |
| `.animate-drift` | `drift-x 15s ease-in-out infinite` |
| `.animate-spiral-in` | `spiral-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards` |
| `.animate-page-enter` | `page-enter 0.4s ease-out forwards` |
| `.animate-shimmer-sweep` | `shimmer-sweep 2s linear infinite` |

### Transition-only utilities/classes
| Class | Transition |
|---|---|
| `.trip-card-hover` | `transform 0.2s ease-out, box-shadow 0.2s ease-out` |
| `.img-fade-in` | `opacity 0.3s ease-in` |
| `.dropdown-item-shimmer::before` | `opacity 0.2s` |
| `.cl-socialButtonsBlockButton` | `transform 0.15s ease, box-shadow 0.15s ease` |

## 3C. Custom graphics / texture utilities in globals

### Scrollbars
- `.scroll-area-viewport`
- scrollbar width `8px`
- thumb uses `hsl(var(--border))`
- hover thumb uses `hsl(var(--muted-foreground) / 0.5)`

### Ribbon system
- `.ribbon-overlay`
- `.ribbon-paused`
- `.ribbon-unavailable`

These are unusually stylized global utilities with:
- layered shadows
- pseudo-element folded ends
- repeating-linear-gradient texture
- text-shadow for depth
- explicit raw colors like `#f59e0b`, `#d97706`, `#475569`, `#334155`

---

# 4. Raw color / shadow / border extraction from `globals.css`

## Raw hex / rgba values
| Value | Where |
|---|---|
| `rgba(255, 255, 255, 0.3)` | `.shimmer-effect` |
| `rgba(0, 0, 0, 0.15)` | ribbon shadow |
| `rgba(0, 0, 0, 0.1)` | ribbon shadow / hover |
| `rgba(255, 255, 255, 0.2)` | ribbon inset |
| `rgba(0, 0, 0, 0.2)` | ribbon inset / text-shadow |
| `rgba(0, 0, 0, 0.03)` | ribbon texture |
| `rgba(255, 255, 255, 0.03)` | ribbon texture |
| `rgba(0, 0, 0, 0.3)` | text-shadow |
| `rgba(0, 0, 0, 0.4)` | text-shadow |
| `#f59e0b` | paused ribbon bg |
| `#d97706` | paused ribbon fold |
| `#475569` | unavailable ribbon bg |
| `#334155` | unavailable ribbon fold |

## Global box-shadows / text-shadows beyond tokens
| Selector | Shadow |
|---|---|
| `.trip-card-hover:hover` | `var(--shadow-lg)` |
| `.ribbon-overlay` | `0 2px 4px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)` |
| `.ribbon-overlay` text shadow | `0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), 0 -1px 0 rgba(0,0,0,0.4)` |
| `.cta-glow` | `0 12px 30px hsl(var(--primary) / 0.35), 0 3px 10px hsl(var(--primary) / 0.2)` |
| `.cta-glow:hover` | `0 18px 40px hsl(var(--primary) / 0.45), 0 6px 16px hsl(var(--primary) / 0.25)` |
| `.cl-socialButtonsBlockButton:hover` | `0 2px 8px rgba(0, 0, 0, 0.1)` |
| `@keyframes pulse-glow` | animated glow shadows |

---

# 5. Shared UI component matrix

Below is an exhaustive matrix for the **retrieved** `src/components/ui/*` files.

---

## 5A. Badge

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
```

### Badge matrix

| Property | Details |
|---|---|
| Base shape | `rounded-full` pill |
| Base border | `border` |
| Base spacing | `px-2.5 py-0.5` |
| Typography | `text-xs font-semibold` |
| Interaction | `transition-colors`, focus ring |
| Variant: default | primary solid pill |
| Variant: secondary | secondary solid pill |
| Variant: destructive | destructive solid pill |
| Variant: outline | text-only foreground with border retained |
| Focus state | `focus:ring-2 focus:ring-ring focus:ring-offset-2` |
| Hover state | solid variants reduce opacity via `/80` background |

### Aesthetic summary
Small semantic pills; rounded, lightweight, standard shadcn-style badge structure but using the app’s purple/orange semantic theme.

---

## 5B. Input

```tsx
const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
```

### Input matrix

| Property | Details |
|---|---|
| Base shape | `rounded-md` |
| Base border | `border border-input` |
| Background | `bg-background` |
| Width | `w-full` by default |
| Typography | `text-sm`; file input text also `text-sm font-medium` |
| Placeholder | `placeholder:text-muted-foreground` |
| Focus | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Disabled | `cursor-not-allowed opacity-50` |
| Wrapper | `relative flex flex-col gap-1` |
| Label | `text-sm font-medium leading-none`; destructive when error |
| Left/right icons | absolutely positioned at `left-3` / `right-3` |
| Icon padding compensation | `pl-10` / `pr-10` |

### Variants
| Variant | Classes |
|---|---|
| `default` | `border-input` |
| `error` | `border-destructive focus-visible:ring-destructive` |
| `success` | `border-green-500 focus-visible:ring-green-500` |
| `warning` | `border-yellow-500 focus-visible:ring-yellow-500` |

### Sizes
| Size | Classes |
|---|---|
| `default` | `h-10 px-3 py-2` |
| `sm` | `h-9 px-3 text-xs` |
| `lg` | `h-11 px-4 text-base` |

### States
| State | Behavior |
|---|---|
| Error | label turns destructive, `aria-invalid`, message rendered below |
| Helper | muted helper text |
| Full width | default true |
| Disabled | opacity drop, no pointer affordance |

### Aesthetic summary
Clean neutral form fields with semantic validation modes; mostly understated, allowing purple focus ring to provide brand identity.

---

## 5C. Form primitives

```tsx
<div ref={ref} className={cn('space-y-2', className)} {...props} />
...
'className={cn(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  error && 'text-destructive',
  className,
)}'
```

### Form matrix

| Subcomponent | Styling |
|---|---|
| `FormItem` | `space-y-2` vertical rhythm |
| `FormLabel` | `text-sm font-medium leading-none`, destructive on error |
| `FormDescription` | `text-muted-foreground text-sm` |
| `FormMessage` | `text-destructive text-sm font-medium` |
| `FormControl` | no inherent visual styling; ARIA wrapper |

### Aesthetic summary
Very restrained accessibility-oriented form wrapper layer. Spacing and text treatment are the main style contributions.

---

## 5D. Progress

```tsx
className={cn('bg-secondary relative h-4 w-full overflow-hidden rounded-full', className)}
...
className='bg-primary h-full w-full flex-1 transition-all'
```

### Progress matrix

| Property | Details |
|---|---|
| Track background | `bg-secondary` |
| Shape | `rounded-full` |
| Height | `h-4` |
| Width | `w-full` |
| Overflow | hidden |
| Indicator color | `bg-primary` |
| Indicator motion | `transition-all` |
| Value behavior | translateX based on percentage |

### Aesthetic summary
Bright dual-brand progress bar: orange track, purple fill. More colorful than a neutral enterprise progress meter.

---

## 5E. Separator

```tsx
className={cn(
  'bg-border shrink-0',
  orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
```

### Separator matrix

| Property | Details |
|---|---|
| Color | `bg-border` |
| Thickness | `1px` |
| Orientation | horizontal or vertical |
| Layout behavior | `shrink-0` |

### Aesthetic summary
Minimal neutral divider using tokenized border color.

---

## 5F. Switch

```tsx
'focus-visible:ring-ring focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-input peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ...'
```

### Switch matrix

| Property | Details |
|---|---|
| Track size | `h-6 w-11` |
| Shape | `rounded-full` |
| Border | `border-2 border-transparent` |
| Checked state | `bg-primary` |
| Unchecked state | `bg-input` |
| Thumb | `bg-background h-5 w-5 rounded-full shadow-lg` |
| Thumb motion | `transition-transform` |
| Thumb positions | `translate-x-5` checked, `translate-x-0` unchecked |
| Focus | ring + offset |
| Disabled | opacity + cursor-not-allowed |

### Aesthetic summary
Standard modern pill switch; brand shows only when active via purple track. Strong visual affordance due to large rounded thumb and shadow.

---

## 5G. Sheet

```tsx
'className={cn(
  'bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-40 backdrop-blur-sm',
```

### Confirmed sheet traits

| Subcomponent | Styling |
|---|---|
| `SheetOverlay` | `bg-background/80`, fixed fullscreen, `z-40`, `backdrop-blur-sm`, animate-in/out |
| `sideClasses.top` | `inset-x-0 top-0 h-[40vh] border-b` |
| `sideClasses.right` | `inset-y-0 right-0 w-80 border-l` |
| `sideClasses.bottom` | `inset-x-0 bottom-0 h-[50vh] border-t` |

The snippet truncates before the full content component, but enough is visible to confirm:
- token-aware translucent backdrop
- side-dependent panel shell
- panel edges delineated by borders

### Aesthetic summary
A blurred, soft, edge-attached off-canvas surface. It fits the app’s glassy/soft-elevation UI language.

---

## 5H. Shimmer Skeleton

```tsx
<div
  className={cn(
    'shimmer rounded-md',
    variant === 'circle' && 'rounded-full',
    variant === 'text' && 'h-4 rounded',
```

### Shimmer skeleton matrix

| Property | Details |
|---|---|
| Base class | `shimmer` from global CSS |
| Base shape | `rounded-md` |
| Variant: rectangle | default |
| Variant: circle | `rounded-full` |
| Variant: text | `h-4 rounded` |
| Width/height | passed through props/class names |
| Accessibility | `aria-hidden='true'` |

### TripCardSkeleton composition
| Area | Styling |
|---|---|
| Outer card | `bg-card overflow-hidden rounded-lg border` |
| Image area | `shimmer aspect-[4/3] w-full` |
| Content padding | `p-4 space-y-3` |
| Grid wrapper | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` |

### Aesthetic summary
Premium shimmer loader aligned with card UI; not just pulse blocks, but polished marketplace loading placeholders.

---

## 5I. Collapsible

```tsx
const Collapsible = CollapsiblePrimitive.Root
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent
```

### Matrix
No styling is defined here; this is a pure re-export wrapper.

| Property | Status |
|---|---|
| Visual opinion | none |
| Styling source | caller-defined |
| Role | primitive exposure only |

---

# 6. Retrieved-vs-exported UI surface map

## Exported by `ui/index.ts`
- alert-dialog
- button
- card
- input
- form
- dialog
- theme-toggle
- select
- popover
- calendar
- skeleton
- loading-skeleton
- lazy-load
- alert
- slider
- checkbox
- badge
- collapsible
- avatar
- label
- separator
- dropdown-menu
- rating
- photo-upload
- textarea
- tooltip
- progress
- sheet
- motion
- animated-counter
- placeholder-image

## Retrieved in this pass
- `badge.tsx`
- `input.tsx`
- `form.tsx`
- `progress.tsx`
- `separator.tsx`
- `switch.tsx`
- `sheet.tsx`
- `shimmer-skeleton.tsx`
- `collapsible.tsx`
- plus `globals.css`

## Mentioned in earlier pass and still relevant
- `button.tsx`
- `dialog.tsx`
- `calendar.tsx`
- `alert.tsx`
- `avatar.tsx`
- `label.tsx`
- `tooltip.tsx`
- `skeleton.tsx`
- `motion.tsx`

So for a truly complete component matrix, those earlier retrieved files should be combined with this pass.

---

# 7. Consolidated component matrix

This table merges **this pass** with the **previously retrieved shared components**, but only includes claims supported by actual retrieved file content.

| Component | Base shape | Main colors | Variants | States | Motion/transition | Notes |
|---|---|---|---|---|---|---|
| Button | rounded-md / rounded-full pill variants | primary / secondary / destructive / gradient | default, destructive, outline, secondary, ghost, link, gradient, pill, glow | hover, tap, loading, disabled, focus | Framer Motion scale + content fade | most expressive CTA primitive |
| Badge | rounded-full | primary / secondary / destructive / foreground | default, secondary, destructive, outline | hover, focus | `transition-colors` | small semantic pills |
| Input | rounded-md | background, input border, destructive/green/yellow states | default, error, success, warning + size variants | focus, error, helper, disabled | none beyond CSS transitions/ring | icon slots |
| Alert | rounded-lg | background/destructive/success/warning/info | default, destructive, success, warning, info | static | none | semantic notice box |
| Dialog | rounded-lg modal | background + black overlays | overlay variants + size variants | open/close | animate-in/out + zoom/slide | centered modal |
| Sheet | edge-attached panel | background + translucent overlay | side-based layout | open/close | animate-in/out | off-canvas pattern |
| Tooltip | rounded-md | primary bg, primary fg | none | open/close | fade/zoom/slide | compact |
| Checkbox | rounded-sm | primary checked | none | checked, focus, disabled | none | classic control |
| Switch | rounded-full | primary checked, input unchecked | none | checked/unchecked, focus, disabled | thumb translate | modern pill toggle |
| Progress | rounded-full | secondary track, primary bar | none | value change | `transition-all` | colorful meter |
| Separator | 1px rule | border | horizontal / vertical | static | none | neutral divider |
| Avatar | rounded-full | muted fallback | none | image/fallback | none | base avatar primitive |
| Label | none | inherited | none | disabled peer | none | type styling only |
| Form* | spacing/text wrappers | muted/destructive text | none | error-aware | none | accessibility wrappers |
| Skeleton | rounded-md | muted | none | loading | `animate-pulse` | basic loader |
| ShimmerSkeleton | rounded-md/full | muted gradient | rectangle/circle/text | loading | shimmer animation | premium loader |
| Calendar | mixed rounded cells | primary/accent/muted | date state variants | selected/today/outside/disabled | button hover via shared button variants | fully re-skinned DayPicker |
| Motion utilities | n/a | n/a | reveal/stagger/tilt/etc. | in-view, hover | Framer Motion | interaction framework |

---

# 8. Token-to-component usage map

## Color tokens consumed by shared UI
| Token | Confirmed consumers |
|---|---|
| `background` | input, dialog, sheet overlay, switch thumb, body |
| `foreground` | body, headings, badge outline |
| `primary` | button, badge default, checkbox checked, switch checked, progress indicator, tooltip bg, CTA glow |
| `primary-foreground` | button, badge, checkbox, tooltip text |
| `secondary` | button, badge secondary, progress track |
| `secondary-foreground` | button secondary, badge secondary |
| `destructive` | button destructive, badge destructive, input error, form label/message, alert destructive |
| `muted` | shimmer, skeleton systems, muted loaders |
| `muted-foreground` | placeholders, helper text, icon slots, scrollbar hover |
| `accent` | calendar today / hover systems from earlier pass |
| `border` | universal border application, separator, scrollbars |
| `input` | input border, switch unchecked background |
| `ring` | focus styling across badge/input/switch/checkbox |

## Typography tokens consumed by shared UI
| Token | Confirmed consumers |
|---|---|
| `--font-body` | body |
| `--font-display` | headings, display utilities |
| `--font-size-xs` | badges, small labels, utilities |
| `--font-size-sm` | labels, form text, input text |
| `--font-size-base` | h6, larger inputs |
| `--font-size-xl` → `7xl` | heading hierarchy, display utilities |
| line-height tokens | headings, body, article content, display utilities |
| tracking tokens | headings, tracking utility classes, display utilities |

## Shape/depth tokens consumed by shared UI
| Token | Confirmed consumers |
|---|---|
| `--radius*` | through Tailwind rounded scale across inputs/cards/badges/buttons |
| `--shadow-lg` | trip-card-hover, switch thumb shadow uses Tailwind `shadow-lg`, button glow/pill variants |
| `--shadow*` | tokenized in Tailwind config for broad component use |

---

# 9. Strong styling patterns visible across the shared UI layer

## Pattern 1: Semantic tokens first
Most primitives use:
- `bg-primary`
- `text-primary-foreground`
- `bg-background`
- `border-input`
- `focus-visible:ring-ring`

This means color semantics are highly normalized.

## Pattern 2: Rounded, soft shapes
Repeated shape language:
- `rounded-md`
- `rounded-lg`
- `rounded-full`

No sharp/brutalist geometry in the primitive layer.

## Pattern 3: Focus accessibility is standardized
Frequent pattern:
- `focus-visible:ring-2`
- `focus-visible:ring-ring`
- `focus-visible:ring-offset-2`
- `focus-visible:ring-offset-background`

## Pattern 4: Transition language is soft and brief
Many components use:
- `transition-colors`
- `transition-all`
- `0.2s` to `0.3s`
- `ease-out` / `ease-in-out`

## Pattern 5: Premium loading is a first-class concern
There are **two separate skeleton systems**:
- pulse-based `Skeleton`
- shimmer-based `ShimmerSkeleton`

That suggests loading aesthetics are intentionally designed, not incidental.

---

# 10. Most notable design conclusions from this second pass

## The token system is richer than a normal Tailwind app
Because `globals.css` defines:
- color semantics
- full type scale
- tracking scale
- z-index scale
- shadow scale
- radii scale

this is clearly a structured design system, not just a utility codebase.

## The UI primitive layer is mostly “soft, semantic, accessible”
Shared components favor:
- rounded corners
- neutral surfaces
- semantic focus rings
- restrained base visuals
- bright branded accents when active or emphasized

## The app’s stronger visual personality lives in globals + higher-order components
The most theatrical styling is not in the base primitives, but in:
- global animation utilities
- glow/shimmer/ribbon effects
- premium texture overlays
- CTA gradients
- motion wrappers

So the architecture is:
- **primitives = clean and reusable**
- **experience layer = expressive and branded**

That separation is a sign of a thoughtful frontend system.


