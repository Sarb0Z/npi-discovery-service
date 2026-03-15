import { ProviderType, type ProviderDto } from '@npi/contracts'
import { Building2, MapPin, Phone, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface ProviderCardProps {
  provider: ProviderDto
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const isIndividual = provider.type === ProviderType.Individual

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_24px_64px_-16px_hsl(var(--primary)/0.2)]">
        <CardContent className="flex h-full flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--secondary)/0.18))] text-[var(--brand-700)]">
                  {isIndividual ? (
                    <UserRound className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                </span>
                <span
                  className={isIndividual ? 'text-[hsl(var(--primary-hover))]' : 'text-[hsl(var(--secondary-active))]'}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-70">
                    Provider type
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-[var(--ink-900)]">
                    {isIndividual ? 'Individual' : 'Organization'}
                  </span>
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink-900)]">{provider.name}</h3>
                <p className="text-sm text-[var(--ink-500)]">NPI {provider.npi}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[hsl(var(--border)/0.72)] bg-[linear-gradient(180deg,hsl(var(--card)/0.78),hsl(var(--surface)/0.44))] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-500)]">
              Specialty profile
            </p>
            <p className="mt-2 text-base font-semibold text-[var(--ink-900)]">
              {provider.primarySpecialty}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">
              {provider.specialties.slice(1, 3).join(' • ') || 'No secondary specialties listed'}
            </p>
          </div>

          <div className="space-y-3 text-sm text-[var(--ink-700)]">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-[var(--ink-500)]" />
              <div>
                <p>{provider.address.address1}</p>
                {provider.address.address2 ? <p>{provider.address.address2}</p> : null}
                <p>
                  {provider.address.city}, {provider.address.state} {provider.address.zipCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[var(--ink-500)]" />
              <a
                className="transition hover:text-[var(--brand-700)]"
                href={provider.phone ? `tel:${provider.phone}` : undefined}
              >
                {provider.phone ?? 'No phone on record'}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
