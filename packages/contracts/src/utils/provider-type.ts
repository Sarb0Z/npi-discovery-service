import { NppesEnumerationType, ProviderType } from '../constants/provider.constants'

export function toNppesEnumerationType(
  providerType?: ProviderType,
): NppesEnumerationType | undefined {
  if (providerType === ProviderType.Individual) {
    return NppesEnumerationType.Individual
  }

  if (providerType === ProviderType.Organization) {
    return NppesEnumerationType.Organization
  }

  return undefined
}

export function fromNppesEnumerationType(
  enumerationType?: NppesEnumerationType,
): ProviderType | undefined {
  if (enumerationType === NppesEnumerationType.Individual) {
    return ProviderType.Individual
  }

  if (enumerationType === NppesEnumerationType.Organization) {
    return ProviderType.Organization
  }

  return undefined
}
