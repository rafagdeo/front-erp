import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { dateInputValue, isValidDateInput, normalizeDateInput } from "../utils/format";
import { getPopoverPosition } from "../utils/popoverPosition";

const today = () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const toDate = (value) => {
  const formatted = dateInputValue(value);
  if (!isValidDateInput(formatted)) return today();
  const [day, month, year] = formatted.split("/").map(Number);
  return new Date(year, month - 1, day);
};
const toValue = (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

export function DatePicker({ value, onChange, ariaLabel, placeholder = "Selecionar data", className = "", align = "start" }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => toDate(value));
  const root = useRef(null);
  const anchor = useRef(null);
  const calendar = useRef(null);
  const toggle = useRef(null);
  const calendarId = useId();
  const formatted = dateInputValue(value);
  const invalid = formatted.length === 10 && !isValidDateInput(formatted);
  const firstWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const monthLabel = useMemo(() => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(view), [view]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target) && !calendar.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      toggle.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const panel = calendar.current;
    const field = anchor.current;
    if (!panel || !field) return undefined;

    const position = () => {
      // Measure the full calendar even when a short viewport requires it to scroll.
      panel.style.maxHeight = "none";
      const { top, left, maxHeight } = getPopoverPosition(
        field.getBoundingClientRect(),
        { width: panel.offsetWidth, height: panel.offsetHeight },
        { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
        align,
      );
      Object.assign(panel.style, {
        top: `${top}px`, left: `${left}px`, maxHeight: `${maxHeight}px`, visibility: "visible",
      });
    };
    position();
    const onScroll = (event) => {
      if (!panel.contains(event.target)) position();
    };
    window.addEventListener("resize", position);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, view, align]);

  function choose(selected) {
    onChange(toValue(selected));
    setOpen(false);
    toggle.current?.focus({ preventScroll: true });
  }

  return (
    <div className={`relative ${className}`} ref={root}>
      <div ref={anchor} className={`flex h-[42px] items-center rounded-md border bg-white transition focus-within:ring-2 ${invalid ? "border-[#d77b6d] focus-within:ring-[#fbe7e2]" : "border-[#dfe5dd] focus-within:border-[#789b70] focus-within:ring-[#e6f0e2]"}`}>
        <input
          type="text" inputMode="numeric" autoComplete="off" placeholder={placeholder}
          aria-label={ariaLabel} aria-invalid={invalid} value={formatted}
          onChange={(event) => onChange(normalizeDateInput(event.target.value))}
          onFocus={() => setView(toDate(value))}
          className="min-w-0 w-full flex-1 rounded-md border-0 bg-transparent px-3 py-2 font-normal text-[#344238] outline-none placeholder:text-[#8b958c]"
        />
        <button ref={toggle} type="button" onClick={() => { setView(toDate(value)); setOpen((state) => !state); }}
          className={`mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-md transition ${open ? "bg-[#e9f2e5] text-[#365b42]" : "text-[#748176] hover:bg-[#f1f5ee] hover:text-[#365b42]"}`}
          aria-label={open ? "Fechar calendário" : "Abrir calendário"} aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? calendarId : undefined}>
          <CalendarDays size={16} />
        </button>
      </div>
      {invalid && <span className="mt-1 block text-xs font-medium text-[#ad5549]">Data inválida. Confira o dia e o mês.</span>}
      {open && createPortal(
        <div ref={calendar} id={calendarId} style={{ visibility: "hidden" }} className="fixed z-[200] w-[min(304px,calc(100vw-24px))] overflow-y-auto overscroll-contain rounded-xl border border-[#e4eae1] bg-white p-3.5 shadow-[0_16px_44px_rgba(26,45,31,0.2)] animate-[settle-in_0.16s_ease_both]" role="dialog" aria-label="Selecionar data">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-[#667268] hover:bg-[#f2f6ef]" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} aria-label="Mês anterior"><ChevronLeft size={19} /></button>
            <strong className="capitalize text-sm font-bold text-[#304136]">{monthLabel}</strong>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg text-[#667268] hover:bg-[#f2f6ef]" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label="Próximo mês"><ChevronRight size={19} /></button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold text-[#929c93]">{["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => <span key={`${day}-${index}`} className="py-1">{day}</span>)}</div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstWeekday }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const date = new Date(view.getFullYear(), view.getMonth(), day);
              const selected = isValidDateInput(formatted) && toValue(toDate(formatted)) === toValue(date);
              const isToday = toValue(today()) === toValue(date);
              return <button key={day} type="button" onClick={() => choose(date)} aria-pressed={selected}
                className={`mx-auto grid h-9 w-9 max-w-full place-items-center rounded-full text-sm transition ${selected ? "bg-[#1d3b2d] font-bold text-white shadow-sm" : isToday ? "font-bold text-[#416b45] ring-1 ring-[#cbdcc4]" : "text-[#455248] hover:bg-[#edf4e9]"}`}>{day}</button>;
            })}
          </div>
          <div className="mt-3 border-t border-[#edf0eb] pt-2 text-center">
            <button type="button" className="rounded px-3 py-1.5 text-xs font-bold text-[#436a49] hover:bg-[#f2f6ef]" onClick={() => choose(today())}>Hoje</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
