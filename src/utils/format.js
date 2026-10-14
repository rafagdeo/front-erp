export function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
}

export function dateLabel(value) {
  if (!value) return '—'
  const raw = String(value)
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return `${br[1]}/${br[2]}/${br[3]}`
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function localDateTimeValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function apiDateTime(value) {
  if (!value) return ""
  if (value.includes("/")) return `${value} 12:00`
  const [date] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} 12:00`
}

export function dateInputValue(value) {
  if (!value) return ""
  const raw = String(value).trim()
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  if (br) return `${br[1]}/${br[2]}/${br[3]}`
  return /^\d{0,2}(?:\/\d{0,2})?(?:\/\d{0,4})?$/.test(raw) ? raw : ""
}

export function normalizeDateInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function isValidDateInput(value) {
  const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [, day, month, year] = match.map(Number)
  if (month < 1 || month > 12 || day < 1 || year < 1900) return false
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}
