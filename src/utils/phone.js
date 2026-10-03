export function phoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 11)
}

export function formatPhone(value) {
  const digits = phoneDigits(value)
  if (digits.length < 10) return digits
  const area = digits.slice(0, 2)
  const subscriber = digits.slice(2)
  return digits.length > 10
    ? `(${area}) ${subscriber.slice(0, 5)}-${subscriber.slice(5)}`
    : `(${area}) ${subscriber.slice(0, 4)}-${subscriber.slice(4)}`
}