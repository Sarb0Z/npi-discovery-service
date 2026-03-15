'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COMMON_SPECIALTIES } from '@/lib/constants/specialties'
import { STATE_OPTIONS } from '@/lib/constants/states'
import {
  bulkSchema,
  searchSchema,
  type BulkFormValues,
  type SearchFormValues,
} from '@/lib/schemas/search.schema'
import type { SearchMode } from '@/lib/stores/search-store'
import { useSearchStore } from '@/lib/stores/search-store'
import { cn } from '@/lib/utils'

interface SearchFormProps {
  variant?: 'search' | 'bulk'
  defaultValues?: Partial<BulkFormValues>
  isSubmitting?: boolean
  submitLabel?: string
  onSubmit: (values: SearchFormValues | BulkFormValues) => void
}

function getModeFromValues(values: Partial<SearchFormValues>): SearchMode {
  if (values.npi) {
    return 'npi'
  }

  if (values.zipCode) {
    return 'zip'
  }

  if (values.city) {
    return 'cityState'
  }

  return 'stateOnly'
}

export function SearchForm({
  variant = 'search',
  defaultValues,
  isSubmitting = false,
  submitLabel,
  onSubmit,
}: SearchFormProps) {
  const searchMode = useSearchStore((state) => state.searchMode)
  const setSearchMode = useSearchStore((state) => state.setSearchMode)
  const recentSearches = useSearchStore((state) => state.recentSearches)

  const resolver = (
    variant === 'bulk' ? zodResolver(bulkSchema) : zodResolver(searchSchema)
  ) as Resolver<BulkFormValues>
  const form = useForm<BulkFormValues>({
    resolver,
    defaultValues: {
      npi: defaultValues?.npi ?? '',
      zipCode: defaultValues?.zipCode ?? '',
      city: defaultValues?.city ?? '',
      state: defaultValues?.state ?? '',
      taxonomyCode: defaultValues?.taxonomyCode ?? '',
      taxonomyDescription: defaultValues?.taxonomyDescription ?? '',
      providerType: defaultValues?.providerType,
      batchSize: defaultValues?.batchSize ?? 200,
    },
    mode: 'onChange',
  })

  const taxonomyValue = useWatch({ control: form.control, name: 'taxonomyDescription' }) ?? ''
  const deferredTaxonomy = useDeferredValue(taxonomyValue)
  const suggestions = useMemo(() => {
    if (!deferredTaxonomy) {
      return COMMON_SPECIALTIES.slice(0, 6)
    }

    return COMMON_SPECIALTIES.filter((specialty) =>
      specialty.toLowerCase().includes(deferredTaxonomy.toLowerCase()),
    ).slice(0, 6)
  }, [deferredTaxonomy])

  const providerType = useWatch({ control: form.control, name: 'providerType' })

  useEffect(() => {
    if (!defaultValues) {
      return
    }

    const nextMode = getModeFromValues(defaultValues)

    setSearchMode(nextMode)
    form.reset({
      ...form.getValues(),
      npi: defaultValues.npi ?? '',
      zipCode: defaultValues.zipCode ?? '',
      city: defaultValues.city ?? '',
      state: defaultValues.state ?? '',
      taxonomyCode: defaultValues.taxonomyCode ?? '',
      taxonomyDescription: defaultValues.taxonomyDescription ?? '',
      providerType: defaultValues.providerType,
      batchSize: defaultValues.batchSize ?? form.getValues('batchSize') ?? 200,
    })
  }, [defaultValues, form, setSearchMode])

  const handleModeChange = (mode: string) => {
    const nextMode = mode as SearchMode
    setSearchMode(nextMode)

    if (nextMode === 'zip') {
      form.setValue('npi', '')
      form.setValue('city', '')
      form.setValue('state', '')
    }

    if (nextMode === 'cityState') {
      form.setValue('npi', '')
      form.setValue('zipCode', '')
    }

    if (nextMode === 'stateOnly') {
      form.setValue('npi', '')
      form.setValue('zipCode', '')
      form.setValue('city', '')
    }

    if (nextMode === 'npi') {
      form.setValue('zipCode', '')
      form.setValue('city', '')
      form.setValue('state', '')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative gap-4">
        <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_58%),radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.18),transparent_55%)]" />
        <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--foreground)/0.3),transparent)]" />
        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-500)]">
              Search desk
            </p>
            <CardTitle className="text-display-md mt-3 max-w-3xl">
              Discover providers without the friction.
            </CardTitle>
            <CardDescription className="mt-3 max-w-2xl text-base">
              Built for broad state discovery, precise ZIP drilling, and specialty-led network
              analysis.
            </CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Find by', 'NPI, geography, taxonomy'],
              ['Filter by', 'individual or organization'],
              ['Return', variant === 'bulk' ? 'collection-ready batches' : 'search-ready results'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[22px] border border-[hsl(var(--border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--card)/0.72),hsl(var(--surface)/0.48))] px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-500)]">
                  {label}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink-900)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs onValueChange={handleModeChange} value={searchMode}>
          <TabsList>
            <TabsTrigger value="npi">NPI</TabsTrigger>
            <TabsTrigger value="zip">ZIP Code</TabsTrigger>
            <TabsTrigger value="cityState">City + State</TabsTrigger>
            <TabsTrigger value="stateOnly">State Only</TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          className="space-y-6"
          onSubmit={(event) => {
            void form.handleSubmit((values) => onSubmit(values))(event)
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className={cn(searchMode === 'npi' ? 'block' : 'hidden')}>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                htmlFor="npi"
              >
                NPI
              </label>
              <Input
                id="npi"
                inputMode="numeric"
                maxLength={10}
                placeholder="1234567893"
                {...form.register('npi')}
              />
              <p className="mt-2 text-xs text-[var(--danger-600)]">
                {form.formState.errors.npi?.message}
              </p>
            </div>

            <div className={cn(searchMode === 'zip' ? 'block' : 'hidden')}>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                htmlFor="zipCode"
              >
                ZIP code
              </label>
              <Input id="zipCode" maxLength={5} placeholder="75201" {...form.register('zipCode')} />
              <p className="mt-2 text-xs text-[var(--danger-600)]">
                {form.formState.errors.zipCode?.message}
              </p>
            </div>

            <div className={cn(searchMode === 'cityState' ? 'block' : 'hidden')}>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                htmlFor="city"
              >
                City
              </label>
              <Input id="city" placeholder="Austin" {...form.register('city')} />
            </div>

            <div className={cn(searchMode !== 'zip' && searchMode !== 'npi' ? 'block' : 'hidden')}>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]">
                State
              </label>
              <Controller
                control={form.control}
                name="state"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATE_OPTIONS.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="mt-2 text-xs text-[var(--danger-600)]">
                {form.formState.errors.state?.message}
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                htmlFor="taxonomyCode"
              >
                Taxonomy code
              </label>
              <Input
                id="taxonomyCode"
                maxLength={10}
                placeholder="1223G0001X"
                {...form.register('taxonomyCode')}
              />
              <p className="mt-2 text-xs text-[var(--danger-600)]">
                {form.formState.errors.taxonomyCode?.message}
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                htmlFor="taxonomyDescription"
              >
                Specialty focus
              </label>
              <Input
                id="taxonomyDescription"
                placeholder="Dentist"
                {...form.register('taxonomyDescription')}
              />
            </div>

            {variant === 'bulk' ? (
              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink-600)]"
                  htmlFor="batchSize"
                >
                  Batch size
                </label>
                <Input
                  id="batchSize"
                  inputMode="numeric"
                  min={50}
                  max={200}
                  type="number"
                  {...form.register('batchSize', { valueAsNumber: true })}
                />
                <p className="mt-2 text-xs text-[var(--danger-600)]">
                  {form.formState.errors.batchSize?.message}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[undefined, 1, 2].map((value) => (
              <button
                key={String(value)}
                className={cn(
                  'group rounded-[22px] border px-4 py-4 text-left transition-all duration-300',
                  providerType === value || (!providerType && value === undefined)
                    ? 'border-transparent bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--secondary))_78%,hsl(var(--tertiary)))] text-white shadow-[0_24px_55px_-24px_hsl(var(--primary)/0.55)]'
                    : 'border-[hsl(var(--border)/0.8)] bg-[linear-gradient(180deg,hsl(var(--card)/0.8),hsl(var(--surface)/0.55))] text-[var(--ink-700)] hover:border-[hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--surface-hover))]',
                )}
                onClick={() =>
                  form.setValue('providerType', value as 1 | 2 | undefined, { shouldDirty: true })
                }
                type="button"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70">
                  Provider scope
                </p>
                <p className="font-display mt-2 text-base font-semibold">
                  {value === 1 ? 'Individuals' : value === 2 ? 'Organizations' : 'All providers'}
                </p>
                <p className="mt-1 text-sm opacity-80">
                  {value === 1
                    ? 'Clinicians and solo practitioners'
                    : value === 2
                      ? 'Groups, facilities, and systems'
                      : 'Return both individual and organization records'}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-500)]">
                Quick specialty picks
              </p>
              <p className="mt-2 text-sm text-[var(--ink-600)]">
                Start with a likely taxonomy, then refine in the results.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {suggestions.map((specialty, index) => (
                <button
                  aria-label={specialty}
                  key={specialty}
                  className="animate-chip-enter rounded-[20px] border border-[hsl(var(--border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--card)/0.82),hsl(var(--surface)/0.48))] px-4 py-3 text-left text-sm text-[var(--ink-700)] transition hover:border-[hsl(var(--primary)/0.4)] hover:shadow-[0_18px_40px_-28px_hsl(var(--primary)/0.45)] hover:text-[var(--ink-900)]"
                  onClick={() =>
                    form.setValue('taxonomyDescription', specialty, { shouldDirty: true })
                  }
                  style={{ animationDelay: `${index * 60}ms` }}
                  type="button"
                >
                  <span className="block font-medium">{specialty}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.22em] text-[var(--ink-500)]">
                    Apply specialty
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-[var(--line)] pt-5">
            {recentSearches.length > 0 ? (
              <>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-500)]">
                    Recent searches
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-600)]">
                    Restore a previous query without rebuilding the form.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recentSearches.map((search) => (
                  <button
                    aria-label={search.label}
                    key={search.query}
                    className="rounded-[18px] border border-[hsl(var(--border)/0.75)] bg-[linear-gradient(180deg,hsl(var(--card)/0.76),hsl(var(--surface)/0.5))] px-4 py-3 text-left transition hover:border-[hsl(var(--primary)/0.28)] hover:bg-[hsl(var(--surface-hover))]"
                    onClick={() => {
                      const params = new URLSearchParams(search.query)
                      const nextValues: Partial<BulkFormValues> = {
                        npi: params.get('npi') ?? '',
                        zipCode: params.get('zipCode') ?? '',
                        city: params.get('city') ?? '',
                        state: params.get('state') ?? '',
                        taxonomyCode: params.get('taxonomyCode') ?? '',
                        taxonomyDescription: params.get('taxonomyDescription') ?? '',
                        providerType: params.get('providerType')
                          ? (Number(params.get('providerType')) as 1 | 2)
                          : undefined,
                      }
                      form.reset({ ...form.getValues(), ...nextValues })
                      startTransition(() => setSearchMode(getModeFromValues(nextValues)))
                    }}
                    type="button"
                  >
                    <span className="block text-sm font-medium text-[var(--ink-900)]">
                      {search.label}
                    </span>
                    <span className="mt-1 block text-[11px] uppercase tracking-[0.24em] text-[var(--ink-500)]">
                      Restore query
                    </span>
                  </button>
                ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="border-t border-[var(--line)] pt-5">
            <Button
              className="w-full"
              disabled={isSubmitting}
              size="lg"
              type="submit"
              variant={variant === 'bulk' ? 'gradient' : 'glow'}
            >
              <Search className="h-4 w-4" />
              {isSubmitting
                ? 'Working…'
                : (submitLabel ??
                  (variant === 'bulk' ? 'Start bulk collection' : 'Search providers'))}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
