export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11)
}

export function formatPhone(value) {
  const digits = phoneDigits(value)
  if (!digits) return ''
  const area = digits.slice(0, 2)
  const subscriber = digits.slice(2)
  if (digits.length <= 2) return `(${area}${digits.length === 2 ? ')' : ''}`
  const prefixLength = digits.length > 10 ? 5 : 4
  const prefix = subscriber.slice(0, prefixLength)
  const suffix = subscriber.slice(prefixLength)
  return `(${area}) ${prefix}${suffix ? `-${suffix}` : ''}`
}

export function isValidPhone(value) {
  return /^\d{10,11}$/.test(String(value || ''))
}