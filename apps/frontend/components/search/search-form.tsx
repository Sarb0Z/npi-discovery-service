'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search, Sparkles } from 'lucide-react'
import { startTransition, useDeferredValue, useMemo } from 'react'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { COMMON_SPECIALTIES } from '@/lib/constants/specialties'
import { STATE_OPTIONS } from '@/lib/constants/states'
import { bulkSchema, searchSchema, type BulkFormValues, type SearchFormValues } from '@/lib/schemas/search.schema'
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

  const resolver = (variant === 'bulk' ? zodResolver(bulkSchema) : zodResolver(searchSchema)) as Resolver<BulkFormValues>
  const form = useForm<BulkFormValues>({
    resolver,
    defaultValues: {
      zipCode: defaultValues?.zipCode ?? '',
      city: defaultValues?.city ?? '',
      state: defaultValues?.state ?? '',
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

  const handleModeChange = (mode: string) => {
    const nextMode = mode as SearchMode
    setSearchMode(nextMode)

    if (nextMode === 'zip') {
      form.setValue('city', '')
      form.setValue('state', '')
    }

    if (nextMode === 'cityState') {
      form.setValue('zipCode', '')
    }

    if (nextMode === 'stateOnly') {
      form.setValue('zipCode', '')
      form.setValue('city', '')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative">
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,var(--brand-soft),transparent_60%),radial-gradient(circle_at_top_right,var(--accent-soft),transparent_55%)]" />
        <Badge className="relative w-fit" variant="primary">
          Search orchestration
        </Badge>
        <CardTitle className="relative text-3xl sm:text-4xl">Discover providers without the friction.</CardTitle>
        <CardDescription className="relative max-w-2xl text-base">
          Designed for broad state discovery, precise ZIP drilling, and specialty-focused network analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs onValueChange={handleModeChange} value={searchMode}>
          <TabsList>
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
            <div className={cn(searchMode === 'zip' ? 'block' : 'hidden')}>
              <label className="mb-2 block text-sm font-medium text-[var(--ink-700)]" htmlFor="zipCode">
                ZIP code
              </label>
              <Input id="zipCode" maxLength={5} placeholder="75201" {...form.register('zipCode')} />
              <p className="mt-2 text-xs text-[var(--danger-600)]">{form.formState.errors.zipCode?.message}</p>
            </div>

            <div className={cn(searchMode === 'cityState' ? 'block' : 'hidden')}>
              <label className="mb-2 block text-sm font-medium text-[var(--ink-700)]" htmlFor="city">
                City
              </label>
              <Input id="city" placeholder="Austin" {...form.register('city')} />
            </div>

            <div className={cn(searchMode !== 'zip' ? 'block' : 'hidden')}>
              <label className="mb-2 block text-sm font-medium text-[var(--ink-700)]">State</label>
              <Controller
                control={form.control}
                name="state"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value && field.value.length > 0 ? field.value : undefined}
                  >
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
              <p className="mt-2 text-xs text-[var(--danger-600)]">{form.formState.errors.state?.message}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--ink-700)]" htmlFor="taxonomyDescription">
                Specialty focus
              </label>
              <Input id="taxonomyDescription" placeholder="Dentist" {...form.register('taxonomyDescription')} />
            </div>

            {variant === 'bulk' ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--ink-700)]" htmlFor="batchSize">
                  Batch size
                </label>
                <Input id="batchSize" inputMode="numeric" min={50} max={200} type="number" {...form.register('batchSize', { valueAsNumber: true })} />
                <p className="mt-2 text-xs text-[var(--danger-600)]">{form.formState.errors.batchSize?.message}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {[undefined, 1, 2].map((value) => (
              <button
                key={String(value)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  providerType === value || (!providerType && value === undefined)
                    ? 'bg-[var(--ink-900)] text-white'
                    : 'bg-[var(--surface-200)] text-[var(--ink-700)] hover:bg-[var(--surface-300)]',
                )}
                onClick={() => form.setValue('providerType', value as 1 | 2 | undefined, { shouldDirty: true })}
                type="button"
              >
                {value === 1 ? 'Individuals' : value === 2 ? 'Organizations' : 'All providers'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-700)]">
              <Sparkles className="h-4 w-4 text-[var(--accent-600)]" />
              Quick specialty picks
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((specialty) => (
                <button
                  key={specialty}
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-sm text-[var(--ink-700)] transition hover:border-[var(--brand-400)] hover:text-[var(--brand-700)]"
                  onClick={() => form.setValue('taxonomyDescription', specialty, { shouldDirty: true })}
                  type="button"
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search.query}
                  className="rounded-full bg-[var(--surface-200)] px-3 py-1.5 text-xs font-medium text-[var(--ink-700)] transition hover:bg-[var(--surface-300)]"
                  onClick={() => {
                    const params = new URLSearchParams(search.query)
                    const nextValues: Partial<BulkFormValues> = {
                      zipCode: params.get('zipCode') ?? '',
                      city: params.get('city') ?? '',
                      state: params.get('state') ?? '',
                      taxonomyDescription: params.get('taxonomyDescription') ?? '',
                      providerType: params.get('providerType') ? Number(params.get('providerType')) as 1 | 2 : undefined,
                    }
                    form.reset({ ...form.getValues(), ...nextValues })
                    startTransition(() => setSearchMode(getModeFromValues(nextValues)))
                  }}
                  type="button"
                >
                  {search.label}
                </button>
              ))}
            </div>
            <Button className="min-w-44" disabled={isSubmitting} size="lg" type="submit">
              <Search className="h-4 w-4" />
              {isSubmitting ? 'Working…' : (submitLabel ?? (variant === 'bulk' ? 'Start bulk collection' : 'Search providers'))}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
