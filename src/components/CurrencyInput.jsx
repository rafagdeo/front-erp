import { NumericFormat } from 'react-number-format'
import { tw } from './tw'

export function CurrencyInput({ value, onValueChange, className = '', ...props }) {
  return (
    <NumericFormat
      {...props}
      className={`${tw.input} ${className}`.trim()}
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