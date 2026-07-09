import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <span className="text-[10px] tracking-[0.3em] font-bold text-accent uppercase">ERRO / PÁGINA NÃO ENCONTRADA</span>
      <h1 className="text-8xl font-serif italic tracking-tight text-text mt-2">404</h1>
      <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent w-48 my-6" />
      <p className="text-xs text-text-muted tracking-widest uppercase font-bold mb-8">Página não encontrada</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  );
}