import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
export function Modal({ title, description, onClose, children, wide = false, headerActions, className = "" }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[rgba(20,37,27,0.48)] p-5 animate-[fade-in_0.16s_ease_both]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`max-h-[min(90vh,850px)] w-full max-w-[480px] overflow-y-auto rounded-md border border-[#e6ebe3] bg-white p-[22px] shadow-[0_20px_65px_rgba(13,30,19,0.22)] max-[620px]:p-[17px] ${wide ? "max-w-[690px]" : ""} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="sticky top-[-22px] z-[2] -mx-[22px] -mt-[22px] mb-[19px] flex items-start justify-between gap-3 border-b border-[#edf0eb] bg-white px-[22px] pb-[18px] pt-[22px] max-[620px]:-mt-[17px] max-[620px]:top-[-17px] max-[620px]:px-[17px] max-[620px]:pt-[17px]">
          <div>
            <h2 className="m-0 font-display text-lg font-bold text-[#2e3b32]" id="modal-title">
              {title}
            </h2>
            {description && (
              <p className="mb-0 mt-1.5 text-sm text-[#858f86]">{description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <button
              className="inline-grid h-[34px] w-[34px] place-items-center rounded border border-transparent bg-transparent text-[#647067] hover:border-[#e5e9e2] hover:bg-[#f8faf6] hover:text-nexo"
              aria-label="Fechar"
              onClick={onClose}
            >
              <X size={19} />
            </button>
          </div>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
