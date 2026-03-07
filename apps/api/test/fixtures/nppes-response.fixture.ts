import { NppesEnumerationType, type NppesRawProvider, type NppesRawResponse } from '@npi/contracts'

export function createRawIndividualProvider(
  overrides: Partial<NppesRawProvider> = {},
): NppesRawProvider {
  return {
    number: '1234567893',
    enumeration_type: NppesEnumerationType.Individual,
    basic: {
      first_name: 'Jane',
      last_name: 'Doe',
      credential: 'MD',
    },
    addresses: [
      {
        address_1: '123 Main St',
        address_2: 'Suite 100',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        telephone_number: '5125551000',
      },
      {
        address_1: 'PO Box 10',
        city: 'Austin',
        state: 'TX',
        postal_code: '78767',
      },
    ],
    taxonomies: [
      {
        code: '1223G0001X',
        desc: 'General Practice Dentistry',
        primary: true,
        state: 'TX',
      },
      {
        code: '1223P0300X',
        desc: 'Pediatric Dentistry',
        primary: false,
        state: 'TX',
      },
    ],
    ...overrides,
  }
}

export function createRawOrganizationProvider(
  overrides: Partial<NppesRawProvider> = {},
): NppesRawProvider {
  return {
    number: '1098765432',
    enumeration_type: NppesEnumerationType.Organization,
    basic: {
      organization_name: 'Austin Health Group',
    },
    addresses: [
      {
        address_1: '500 Clinic Ave',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75201',
        telephone_number: '2145552000',
      },
      {
        address_1: 'PO Box 99',
        city: 'Dallas',
        state: 'TX',
        postal_code: '75266',
      },
    ],
    taxonomies: [
      {
        code: '261QF0400X',
        desc: 'Federally Qualified Health Center (FQHC)',
        primary: true,
        state: 'TX',
      },
    ],
    ...overrides,
  }
}

export function createNppesResponse(
  providers: NppesRawProvider[],
  resultCount = providers.length,
): NppesRawResponse {
  return {
    result_count: resultCount,
    results: providers,
  }
}
