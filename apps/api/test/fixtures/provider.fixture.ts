import { ProviderType, type ProviderDto } from '@npi/contracts'

export function createIndividualProvider(overrides: Partial<ProviderDto> = {}): ProviderDto {
  return {
    npi: '1234567893',
    type: ProviderType.Individual,
    name: 'Jane Doe, MD',
    primarySpecialty: 'General Practice Dentistry',
    specialties: ['General Practice Dentistry', 'Pediatric Dentistry'],
    taxonomies: [
      {
        code: '1223G0001X',
        description: 'General Practice Dentistry',
        primary: true,
        state: 'TX',
      },
      {
        code: '1223P0300X',
        description: 'Pediatric Dentistry',
        primary: false,
        state: 'TX',
      },
    ],
    address: {
      address1: '123 Main St',
      address2: 'Suite 100',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
    },
    phone: '5125551000',
    ...overrides,
  }
}

export function createOrganizationProvider(overrides: Partial<ProviderDto> = {}): ProviderDto {
  return {
    npi: '1098765432',
    type: ProviderType.Organization,
    name: 'Austin Health Group',
    primarySpecialty: 'Federally Qualified Health Center (FQHC)',
    specialties: ['Federally Qualified Health Center (FQHC)'],
    taxonomies: [
      {
        code: '261QF0400X',
        description: 'Federally Qualified Health Center (FQHC)',
        primary: true,
        state: 'TX',
      },
    ],
    address: {
      address1: '500 Clinic Ave',
      address2: null,
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
    },
    phone: '2145552000',
    ...overrides,
  }
}
