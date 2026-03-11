import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

interface SearchCriteriaHost {
  npi?: string
  zipCode?: string
  city?: string
  state?: string
}

@ValidatorConstraint({ name: 'isValidSearchCriteria', async: false })
export class SearchCriteriaConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, validationArguments: ValidationArguments): boolean {
    const object = validationArguments.object as SearchCriteriaHost
    const hasNpi = typeof object.npi === 'string' && object.npi.trim().length > 0
    const hasZipCode = typeof object.zipCode === 'string' && object.zipCode.trim().length > 0
    const hasCity = typeof object.city === 'string' && object.city.trim().length > 0
    const hasState = typeof object.state === 'string' && object.state.trim().length > 0

    if (!hasNpi && !hasZipCode && !hasState) {
      return false
    }

    if (hasCity && !hasState) {
      return false
    }

    return true
  }

  defaultMessage(): string {
    return 'Provide npi, or zipCode, or state, or city together with state.'
  }
}

export function IsValidSearchCriteria(validationOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isValidSearchCriteria',
      target: object.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: SearchCriteriaConstraint,
    })
  }
}
