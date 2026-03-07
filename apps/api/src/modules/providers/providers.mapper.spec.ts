import 'reflect-metadata'

import { FALLBACK_PROVIDER_NAME, FALLBACK_SPECIALTY, NppesEnumerationType } from '@npi/contracts'
import {
  createRawIndividualProvider,
  createRawOrganizationProvider,
} from '../../../test/fixtures/nppes-response.fixture'
import { mapNppesProvider, mapNppesProviders, matchesPrimaryTaxonomy } from './providers.mapper'

describe('providers.mapper', () => {
  it('maps a raw individual provider into the contract shape', () => {
    const provider = mapNppesProvider(createRawIndividualProvider())

    expect(provider).toEqual({
      npi: '1234567893',
      type: 1,
      name: 'Jane Doe, MD',
      primarySpecialty: 'General Practice Dentistry',
      specialties: ['General Practice Dentistry', 'Pediatric Dentistry'],
      address: {
        address1: '123 Main St',
        address2: 'Suite 100',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      phone: '5125551000',
    })
  })

  it('maps organizations using organization_name', () => {
    const provider = mapNppesProvider(createRawOrganizationProvider())

    expect(provider.name).toBe('Austin Health Group')
    expect(provider.type).toBe(2)
  })

  it('falls back for missing names, specialties, and address fields', () => {
    const provider = mapNppesProvider(
      createRawIndividualProvider({
        basic: {},
        addresses: [],
        taxonomies: [],
      }),
    )

    expect(provider.name).toBe(FALLBACK_PROVIDER_NAME)
    expect(provider.primarySpecialty).toBe(FALLBACK_SPECIALTY)
    expect(provider.address).toEqual({
      address1: '',
      address2: null,
      city: '',
      state: '',
      zipCode: '',
    })
    expect(provider.phone).toBeNull()
  })

  it('maps arrays of providers', () => {
    const providers = mapNppesProviders([
      createRawIndividualProvider(),
      createRawOrganizationProvider(),
    ])

    expect(providers).toHaveLength(2)
    expect(providers[1]?.name).toBe('Austin Health Group')
  })

  it('matches primary taxonomy by description and code', () => {
    const provider = createRawIndividualProvider()

    expect(matchesPrimaryTaxonomy(provider, 'dentistry')).toBe(true)
    expect(matchesPrimaryTaxonomy(provider, undefined, '1223G0001X')).toBe(true)
    expect(matchesPrimaryTaxonomy(provider, 'cardiology')).toBe(false)
    expect(matchesPrimaryTaxonomy(provider, undefined, '9999999999')).toBe(false)
  })

  it('returns false when a taxonomy filter is provided but no primary taxonomy exists', () => {
    const provider = createRawOrganizationProvider({
      enumeration_type: NppesEnumerationType.Organization,
      taxonomies: [{ code: '1', desc: 'Other', primary: false, state: 'TX' }],
    })

    expect(matchesPrimaryTaxonomy(provider, 'Other')).toBe(false)
  })
})
