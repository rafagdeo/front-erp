import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize = 10, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex min-h-[54px] flex-wrap items-center justify-between gap-3 border-t border-[#edf0eb] px-3 py-2 text-sm text-[#778178]">
      <span>Exibindo {start}–{end} de {total}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-[#dfe5dd] bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
        <span className="min-w-[76px] text-center">Página {page} de {pages}</span>
        <button type="button" aria-label="Próxima página" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-[#dfe5dd] bg-white disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
