import { ProviderType, type ProviderDto } from '@npi/contracts'
import { render, screen } from '@testing-library/react'
import { ProviderCard } from '@/components/search/provider-card'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}))

function buildProvider(overrides: Partial<ProviderDto> = {}): ProviderDto {
  return {
    npi: '1234567890',
    type: ProviderType.Individual,
    name: 'Dr. Ada Lovelace',
    primarySpecialty: 'Family Medicine',
    specialties: ['Family Medicine', 'Internal Medicine', 'Geriatrics'],
    taxonomies: [
      {
        code: '207Q00000X',
        description: 'Family Medicine',
        primary: true,
        state: 'TX',
      },
      {
        code: '207R00000X',
        description: 'Internal Medicine',
        primary: false,
        state: 'TX',
      },
    ],
    address: {
      address1: '123 Health Ave',
      address2: 'Suite 100',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    phone: '555-0101',
    ...overrides,
  }
}

describe('ProviderCard', () => {
  it('renders an individual provider with specialties and a phone link', () => {
    render(<ProviderCard provider={buildProvider()} />)

    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(screen.getByText('Dr. Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('NPI 1234567890')).toBeInTheDocument()
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument()
    expect(screen.getByText('Geriatrics')).toBeInTheDocument()
    expect(screen.getByText('Suite 100')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '555-0101' })).toHaveAttribute('href', 'tel:555-0101')
  })

  it('renders an organization with phone fallback text', () => {
    render(
      <ProviderCard
        provider={buildProvider({
          type: ProviderType.Organization,
          name: 'Acme Health Group',
          address: {
            ...buildProvider().address,
            address2: null,
          },
          phone: null,
        })}
      />,
    )

    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Acme Health Group')).toBeInTheDocument()
    expect(screen.getByText('No phone on record')).toBeInTheDocument()
  })
})