import { ProviderType, type ProviderDto } from '@npi/contracts'
import { buildExportFileName } from '@/lib/utils/export'

describe('buildExportFileName', () => {
  it('creates a normalized file name', () => {
    const fileName = buildExportFileName('Austin, TX', 'Family Medicine')

    expect(fileName).toContain('providers_austin-tx_family-medicine_')
    expect(fileName.endsWith('.json')).toBe(true)
  })
})

describe('csv provider typing', () => {
  it('supports provider DTO typing', () => {
    const provider: ProviderDto = {
      npi: '1234567890',
      type: ProviderType.Individual,
      name: 'Dr. Jane Smith',
      primarySpecialty: 'Dentist',
      specialties: ['Dentist'],
      address: {
        address1: '100 Main St',
        address2: null,
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      phone: '512-555-0100',
    }

    expect(provider.type).toBe(ProviderType.Individual)
  })
})
