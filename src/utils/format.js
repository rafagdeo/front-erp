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
  const [date] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} 12:00`
}
