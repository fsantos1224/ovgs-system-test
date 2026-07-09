import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
      <p className="text-lg text-slate-500 mb-6">Página não encontrada</p>
      <Link to="/" className="text-blue-600 hover:underline">Voltar ao Dashboard</Link>
    </div>
  );
}
