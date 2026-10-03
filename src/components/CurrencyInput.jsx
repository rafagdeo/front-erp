import { NumericFormat } from 'react-number-format'
export function CurrencyInput({ value, onValueChange, className = '', ...props }) {
  return (
    <NumericFormat
      {...props}
      className={`min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none ${className}`.trim()}
      value={value}
      valueIsNumericString
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      inputMode="decimal"
      onValueChange={({ floatValue }) => onValueChange(floatValue ?? '')}
    />
  )
}