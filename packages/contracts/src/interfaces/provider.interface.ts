import type { ProviderType } from '../constants/provider.constants'

export interface ProviderAddress {
  address1: string
  address2: string | null
  city: string
  state: string
  zipCode: string
}

export interface ProviderTaxonomy {
  code: string
  description: string
  primary: boolean
  state: string | null
}

export interface ProviderDto {
  npi: string
  type: ProviderType
  name: string
  primarySpecialty: string
  specialties: string[]
  address: ProviderAddress
  phone: string | null
}