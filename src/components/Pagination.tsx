// Paginação server-side. json-server nativo. Sem libs.
import { useState, useEffect } from "react";

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

  const [inputValue, setInputValue] = useState(String(page));

  useEffect(() => {
    setInputValue(String(page));
  }, [page]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = parseInt(inputValue, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      onPageChange(target);
    } else {
      setInputValue(String(page));
    }
  };

  return (
    <nav
      aria-label="Navegação de páginas"
      className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-elevated/10"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-text-faint font-bold">
          Página
        </span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-14 text-center bg-input-bg border border-border text-text text-xs rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
          aria-label="Número da página"
        />
        <span className="text-[10px] uppercase tracking-widest text-text-faint font-bold">
          de {totalPages}
        </span>
        <button
          type="submit"
          className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-border-strong hover:bg-hover text-text focus-visible:outline-2 focus-visible:outline-accent transition-colors"
        >
          Ir
        </button>
      </form>
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