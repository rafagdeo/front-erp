import { NumberFormatBase } from 'react-number-format'
import { phoneDigits } from '../utils/phone'
function formatPhoneInput(value) {
  const digits = phoneDigits(value)
  if (digits.length <= 2) return digits

  const areaCode = digits.slice(0, 2)
  const subscriber = digits.slice(2)
  const prefixLength = digits.length > 10 ? 5 : 4
  const prefix = subscriber.slice(0, prefixLength)
  const suffix = subscriber.slice(prefixLength)

  return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ''}`
}

export function PhoneInput({ value, onValueChange, className = '', ...props }) {
  const digits = phoneDigits(value)

  return (
    <NumberFormatBase
      {...props}
      className={className || "min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"}
      type="tel"
      inputMode="numeric"
      value={digits}
      valueIsNumericString
      format={formatPhoneInput}
      removeFormatting={phoneDigits}
      isAllowed={({ value: numericValue }) => numericValue.length <= 11}
      onValueChange={({ value: numericValue }) => onValueChange(numericValue)}
    />
  )
}