// 🐴 Paginação server-side. json-server nativo. Sem libs.

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Navegação de páginas" className="flex items-center justify-between px-3 py-3 border-t">
      <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="px-3 py-1 text-sm rounded border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
        >
          Anterior
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="px-3 py-1 text-sm rounded border hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
        >
          Próximo
        </button>
      </div>
    </nav>
  );
}
