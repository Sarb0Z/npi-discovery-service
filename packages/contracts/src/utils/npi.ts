const NPI_PREFIX = '80840'
const REQUIRED_NPI_LENGTH = 10

export function isValidNpi(value: string | undefined | null): boolean {
  if (!value || !/^\d{10}$/.test(value)) {
    return false
  }

  const digits = `${NPI_PREFIX}${value}`.split('').map((digit) => Number(digit))
  let sum = 0

  for (let index = digits.length - 2; index >= 0; index -= 2) {
    const digit = digits[index]

    if (digit === undefined) {
      return false
    }

    const doubled = digit * 2
    digits[index] = Math.floor(doubled / 10) + (doubled % 10)
  }

  for (const digit of digits) {
    sum += digit
  }

  return sum % 10 === 0 && value.length === REQUIRED_NPI_LENGTH
}
