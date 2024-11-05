export function formatCLPPrice(value: number | string) {
  const number =
    typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value

  if (isNaN(number)) return '0'
  return number.toLocaleString('es-CL')
}
