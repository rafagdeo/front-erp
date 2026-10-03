import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { tw } from "./tw";

export function Modal({ title, description, onClose, children, wide = false }) {
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
      className={tw.modalBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`${tw.modalPanel} ${wide ? tw.modalWide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className={tw.modalHeader}>
          <div>
            <h2 className={tw.modalTitle} id="modal-title">
              {title}
            </h2>
            {description && (
              <p className={tw.modalDescription}>{description}</p>
            )}
          </div>
          <button
            className={tw.iconButton}
            aria-label="Fechar"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>,
    document.body,
  );
}
