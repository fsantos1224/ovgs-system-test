// 🐴 Layout com sidebar. Nav items condicionais por role. Seletor de role embutido.

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
    { to: '/', label: 'Dashboard', perm: null },
    { to: '/ovs', label: 'Ordens de Venda', perm: 'ov:listar' },
    { to: '/agendamento', label: 'Agendamento', perm: 'agendamento:ver' },
    { to: '/cadastros/clientes', label: 'Clientes', perm: 'clientes:listar' },
    { to: '/cadastros/transportes', label: 'Transportes', perm: 'transportes:listar' },
    { to: '/cadastros/itens', label: 'Itens', perm: 'itens:listar' },
    { to: '/auditoria', label: 'Auditoria', perm: 'auditoria:ver' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 text-lg font-bold border-b border-slate-600">
          OVGS
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            if (item.perm && !usePermissao(item.perm)) return null;
            return (
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
            );
          })}
        </nav>

        {/* 🐴 Seletor de role embutido — para demonstração do RBAC */}
        <div className="p-4 border-t border-slate-600 space-y-2">
          <div className="text-xs text-slate-400">Role atual: {role}</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole['role'])}
            className="w-full text-sm text-slate-800 rounded px-2 py-1"
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
