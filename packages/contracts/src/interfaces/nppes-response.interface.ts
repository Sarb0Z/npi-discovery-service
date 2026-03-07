import type { NppesEnumerationType } from '../constants/provider.constants'

export interface NppesRawAddress {
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postal_code?: string
  telephone_number?: string
}

export interface NppesRawTaxonomy {
  code?: string
  desc?: string
  primary?: boolean
  state?: string
}

export interface NppesRawBasic {
  first_name?: string
  last_name?: string
  organization_name?: string
  credential?: string
}

export interface NppesRawProvider {
  number?: string
  enumeration_type?: NppesEnumerationType
  basic?: NppesRawBasic
  addresses?: NppesRawAddress[]
  taxonomies?: NppesRawTaxonomy[]
}

export interface NppesRawResponse {
  result_count?: number
  results?: NppesRawProvider[]
}

export interface NppesSearchParams {
  version: string
  postal_code?: string
  city?: string
  state?: string
  taxonomy_description?: string
  taxonomy_code?: string
  enumeration_type?: NppesEnumerationType
  limit: number
  skip: number
}