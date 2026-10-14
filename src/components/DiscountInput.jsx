import { useRef } from "react";
import { ArrowLeftRight } from "lucide-react";
import { NumericFormat } from "react-number-format";

export function DiscountInput({ id, value, type = "valor", onValueChange, onTypeChange }) {
  const input = useRef(null);
  const percent = type === "percentual";
  const nextLabel = percent ? "valor em reais" : "percentual";

  return (
    <div className="discount-input">
      <NumericFormat
        id={id}
        getInputRef={input}
        value={value}
        valueIsNumericString
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        allowNegative={false}
        inputMode="decimal"
        aria-label={percent ? "Desconto em percentual" : "Desconto em reais"}
        isAllowed={({ floatValue }) => !percent || floatValue === undefined || floatValue <= 100}
        onValueChange={({ value: numericValue }, source) => {
          if (source.source === "event") onValueChange(numericValue);
        }}
        required
      />
      <button
        type="button"
        title={`Mudar para ${nextLabel}`}
        aria-label={`Mudar desconto para ${nextLabel}`}
        onClick={() => {
          onTypeChange(percent ? "valor" : "percentual");
          input.current?.focus();
        }}
      >
        {percent ? "%" : "R$"}
        <ArrowLeftRight size={12} aria-hidden="true" />
      </button>
    </div>
  );
}
