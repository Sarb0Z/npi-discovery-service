import {
  FALLBACK_PROVIDER_NAME,
  FALLBACK_SPECIALTY,
  type NppesRawAddress,
  NppesEnumerationType,
  type ProviderTaxonomy,
  ProviderType,
  type NppesRawProvider,
  type ProviderAddress,
  type ProviderDto,
} from '@npi/contracts'

export function mapNppesProviders(rawProviders: NppesRawProvider[] | undefined): ProviderDto[] {
  return (rawProviders ?? []).map((rawProvider) => mapNppesProvider(rawProvider))
}

export function mapNppesProvider(rawProvider: NppesRawProvider): ProviderDto {
  const practiceAddress = rawProvider.addresses?.[0]
  const taxonomies = buildTaxonomies(rawProvider)
  const specialties = taxonomies
    .map((taxonomy) => taxonomy.description)
    .filter((specialty): specialty is string => Boolean(specialty))
  const primaryTaxonomy = taxonomies.find((taxonomy) => taxonomy.primary)
  const type =
    rawProvider.enumeration_type === NppesEnumerationType.Organization
      ? ProviderType.Organization
      : ProviderType.Individual

  return {
    npi: rawProvider.number ?? '',
    type,
    name: buildProviderName(rawProvider),
    primarySpecialty: primaryTaxonomy?.description ?? specialties[0] ?? FALLBACK_SPECIALTY,
    specialties,
    taxonomies,
    address: buildAddress(practiceAddress),
    phone: practiceAddress?.telephone_number?.trim() ?? null,
  }
}

export function matchesPrimaryTaxonomy(
  rawProvider: NppesRawProvider,
  taxonomyDescription?: string,
  taxonomyCode?: string,
): boolean {
  if (!taxonomyDescription && !taxonomyCode) {
    return true
  }

  const primaryTaxonomy = rawProvider.taxonomies?.find((taxonomy) => taxonomy.primary)

  if (!primaryTaxonomy) {
    return false
  }

  const matchesDescription = taxonomyDescription
    ? primaryTaxonomy.desc?.toLowerCase().includes(taxonomyDescription.toLowerCase())
    : true
  const matchesCode = taxonomyCode ? primaryTaxonomy.code === taxonomyCode : true

  return Boolean(matchesDescription && matchesCode)
}

function buildProviderName(rawProvider: NppesRawProvider): string {
  const basic = rawProvider.basic

  if (rawProvider.enumeration_type === NppesEnumerationType.Organization) {
    const organizationName = basic?.organization_name?.trim()

    if (!organizationName) {
      return FALLBACK_PROVIDER_NAME
    }

    return organizationName
  }

  const individualName = [basic?.first_name?.trim(), basic?.last_name?.trim()]
    .filter((nameSegment): nameSegment is string => Boolean(nameSegment))
    .join(' ')
  const credential = basic?.credential?.trim()

  if (!individualName) {
    return FALLBACK_PROVIDER_NAME
  }

  return credential ? `${individualName}, ${credential}` : individualName
}

function buildAddress(practiceAddress: NppesRawAddress | undefined): ProviderAddress {
  return {
    address1: practiceAddress?.address_1?.trim() ?? '',
    address2: practiceAddress?.address_2?.trim() ?? null,
    city: practiceAddress?.city?.trim() ?? '',
    state: practiceAddress?.state?.trim() ?? '',
    zipCode: practiceAddress?.postal_code?.trim() ?? '',
  }
}

function buildTaxonomies(rawProvider: NppesRawProvider): ProviderTaxonomy[] {
  return (rawProvider.taxonomies ?? [])
    .map((taxonomy) => ({
      code: taxonomy.code?.trim() ?? '',
      description: taxonomy.desc?.trim() ?? '',
      primary: Boolean(taxonomy.primary),
      state: taxonomy.state?.trim() ?? null,
    }))
    .filter((taxonomy) => taxonomy.code.length > 0 || taxonomy.description.length > 0)
}
