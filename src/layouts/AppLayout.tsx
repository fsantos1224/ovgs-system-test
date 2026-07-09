// 🐴 Layout acessível: skip-to-content, landmark roles, nav semântico.
// Itens sem permissão retornam null (não renderizam, não são focáveis).

import { NavLink, Outlet } from 'react-router-dom';
import { usePermissao, useRole, setRole } from '../hooks/usePermission';
import type { UserRole } from '../domain/types';

const roles: { value: UserRole['role']; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Gerente' },
  { value: 'operator', label: 'Operador' },
  { value: 'viewer', label: 'Visualizador' },
];

export function AppLayout() {
  const role = useRole();

  const navItems = [
    { to: '/', label: 'Dashboard', perm: null as string | null },
    { to: '/ovs', label: 'Ordens de Venda', perm: 'ov:listar' },
    { to: '/agendamento', label: 'Agendamento', perm: 'agendamento:ver' },
    { to: '/cadastros/clientes', label: 'Clientes', perm: 'clientes:listar' },
    { to: '/cadastros/transportes', label: 'Transportes', perm: 'transportes:listar' },
    { to: '/cadastros/itens', label: 'Itens', perm: 'itens:listar' },
    { to: '/auditoria', label: 'Auditoria', perm: 'auditoria:ver' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🐴 Skip-to-content link — primeiro elemento focável */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded">
        Ir para o conteúdo principal
      </a>

      <aside role="navigation" aria-label="Navegação principal" className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-slate-600" aria-label="OVGS — Sistema de Gestão de Ordens de Venda">
          OVGS
        </div>

        <nav aria-label="Menu principal" className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const hasPerm = item.perm ? usePermissao(item.perm) : true;
            if (!hasPerm) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400 ${
                    isActive
                      ? 'bg-slate-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-600 space-y-2">
          <div className="text-xs text-slate-400">Role atual: {role}</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole['role'])}
            aria-label="Selecionar role do usuário"
            className="w-full text-sm text-slate-800 rounded px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-auto p-6" role="main">
        <Outlet />
      </main>
    </div>
  );
}