import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator'
import { isValidNpi } from '../utils/npi'

export function IsNpi(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isNpi',
      target: target.constructor,
      propertyName: propertyName.toString(),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidNpi(value)
        },
        defaultMessage(arguments_: ValidationArguments): string {
          return `${arguments_.property} must be a valid 10-digit NPI number`
        },
      },
    })
  }
}
