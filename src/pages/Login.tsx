import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const msg = login(email, senha);
    if (msg) {
      setErro(msg);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border p-10 space-y-8 animate-fade-in">
        {/* Brand */}
        <div className="text-center space-y-3">
          <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-text-faint">
            XPTO
          </span>
          <h1 className="text-4xl font-serif italic tracking-tight text-text">
            Gestão
          </h1>
          <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent w-full" />
          <p className="text-[10px] text-accent font-bold tracking-[0.18em] uppercase">
            Sistema de Gestão de Ordens de Venda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {erro && (
            <div
              role="alert"
              className="bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-semibold p-4 rounded-lg"
            >
              {erro}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[10px] font-bold text-text-faint uppercase tracking-widest block"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="admin@XPTO.local"
              className="w-full bg-canvas border border-border text-text text-sm font-medium rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden transition-all placeholder:text-text-faint"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="senha"
              className="text-[10px] font-bold text-text-faint uppercase tracking-widest block"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-canvas border border-border text-text text-sm font-medium rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden transition-all placeholder:text-text-faint"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-xs py-3.5 px-4 rounded-lg shadow-lg transition-all duration-150 cursor-pointer text-center uppercase tracking-widest border border-border-strong focus-visible:outline-2 focus-visible:outline-accent"
          >
            Entrar no Sistema
          </button>
        </form>

        {/* Test accounts */}
        <div className="bg-canvas rounded-xl p-5 border border-dashed border-border-strong text-center">
          <p className="text-[9px] font-bold text-text-faint uppercase tracking-widest mb-3">
            Credenciais de Acesso
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@XPTO.local");
                setSenha("admin123");
                setErro("");
              }}
              className="text-xs font-semibold font-mono text-text-muted hover:text-accent hover:bg-hover px-2.5 py-2 border border-border rounded-md transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              admin@XPTO.local / admin123 (Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("viewer@XPTO.local");
                setSenha("viewer123");
                setErro("");
              }}
              className="text-xs font-semibold font-mono text-text-muted hover:text-accent hover:bg-hover px-2.5 py-2 border border-border rounded-md transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
            >
              viewer@XPTO.local / viewer123 (Viewer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
