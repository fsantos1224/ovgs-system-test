// Paginação server-side. json-server nativo. Sem libs.

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Navegação de páginas"
      className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-elevated/10"
    >
      <span className="text-[10px] uppercase tracking-widest text-text-faint font-bold">
        Página <span className="text-text">{page}</span> de <span className="text-text">{totalPages}</span>
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border-strong hover:bg-hover disabled:opacity-30 disabled:pointer-events-none transition-all text-text focus-visible:outline-2 focus-visible:outline-accent"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border-strong hover:bg-hover disabled:opacity-30 disabled:pointer-events-none transition-all text-text focus-visible:outline-2 focus-visible:outline-accent"
        >
          Próximo
        </button>
      </div>
    </nav>
  );
}