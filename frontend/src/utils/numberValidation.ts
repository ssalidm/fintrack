export function hasAtMostFourDecimalPlaces(value: number): boolean {
  if (!Number.isFinite(value)) return false

  const [coefficient, exponent = '0'] = value.toString().split('e')
  const fractionLength = coefficient.split('.')[1]?.length ?? 0

  return fractionLength - Number(exponent) <= 4
}