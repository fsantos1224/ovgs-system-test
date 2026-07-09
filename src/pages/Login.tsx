import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const msg = login(email, senha);
    if (msg) {
      setErro(msg);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-slate-800">OVGS</h1>
        <p className="text-sm text-slate-500 text-center">Sistema de Gestão de Ordens de Venda</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full border rounded px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
            />
          </div>
        </div>

        {erro && <p role="alert" className="text-red-500 text-sm text-center">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition-colors text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
        >
          Entrar
        </button>

        <div className="text-xs text-slate-400 text-center space-y-1">
          <p>Contas de teste:</p>
          <p>admin@ovgs.local / admin123</p>
          <p>viewer@ovgs.local / viewer123</p>
        </div>
      </form>
    </div>
  );
}
