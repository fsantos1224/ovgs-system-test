// 🐴 Layout principal com sidebar estática. Navegação por links.

import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/ordens-venda', label: 'Ordens de Venda' },
  { to: '/agendamento', label: 'Agendamento' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/transportes', label: 'Transportes' },
  { to: '/itens', label: 'Itens' },
];

export function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-slate-600">
          OVGS
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 text-xs text-slate-400 border-t border-slate-600">
          admin
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}