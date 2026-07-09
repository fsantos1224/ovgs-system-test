// Layout acessível: skip-to-content, landmark roles, nav semântico.
// Itens sem permissão retornam null (não renderizam, não são focáveis).

import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Users,
  Truck,
  Package,
  History,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { usePermissao, useRole } from "../hooks/usePermission";
import { useAuth } from "../hooks/useAuth";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("XPTO:theme", theme);
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("XPTO:theme");
  return stored === "light" ? "light" : "dark";
}

export function AppLayout() {
  const role = useRole();
  const { user, logout } = useAuth();

  // ponytail: useState local, sem Context — YAGNI
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  // Hooks no topo do componente — nunca dentro de callback (Rules of Hooks).
  const canSeeOVs = usePermissao("ov:listar");
  const canSeeAgendamento = usePermissao("agendamento:ver");
  const canSeeClientes = usePermissao("clientes:listar");
  const canSeeTransportes = usePermissao("transportes:listar");
  const canSeeItens = usePermissao("itens:listar");
  const canSeeAuditoria = usePermissao("auditoria:ver");

  const navItems = [
    { to: "/", label: "Dashboard", show: true, Icon: LayoutDashboard },
    {
      to: "/ovs",
      label: "Ordens de Venda",
      show: canSeeOVs,
      Icon: ClipboardList,
    },
    {
      to: "/agendamento",
      label: "Agendamento",
      show: canSeeAgendamento,
      Icon: Calendar,
    },
    {
      to: "/cadastros/clientes",
      label: "Clientes",
      show: canSeeClientes,
      Icon: Users,
    },
    {
      to: "/cadastros/transportes",
      label: "Transportes",
      show: canSeeTransportes,
      Icon: Truck,
    },
    {
      to: "/cadastros/itens",
      label: "Itens",
      show: canSeeItens,
      Icon: Package,
    },
    {
      to: "/auditoria",
      label: "Auditoria",
      show: canSeeAuditoria,
      Icon: History,
    },
  ];

  return (
    <div className="flex h-screen bg-canvas">
      {/* Skip-to-content link — primeiro elemento focável */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:text-text focus:px-4 focus:py-2 focus:rounded focus-visible:outline-2 focus-visible:outline-accent"
      >
        Ir para o conteúdo principal
      </a>

      <aside
        role="navigation"
        aria-label="Navegação principal"
        className={`${collapsed ? "w-16" : "w-64"} bg-canvas text-text flex flex-col transition-all duration-200 border-r border-border`}
      >
        <div
          className="p-4 text-lg font-bold border-b border-border flex items-center justify-between gap-2"
          aria-label="XPTO — Sistema de Gestão de Ordens de Venda"
        >
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] tracking-[0.3em] font-bold uppercase text-text-faint">
                XPTO
              </span>
              <span className="font-serif italic text-text">Gestão</span>
            </div>
          )}
          <div
            className={`flex items-center gap-1 ${collapsed ? "ml-auto" : "ml-auto"}`}
          >
            <button
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
              }
              title={theme === "dark" ? "Tema claro" : "Tema escuro"}
              className="p-1.5 rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
            >
              {theme === "dark" ? (
                <Sun size={16} aria-hidden="true" />
              ) : (
                <Moon size={16} aria-hidden="true" />
              )}
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
              aria-expanded={!collapsed}
              className="p-1.5 rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
            >
              {collapsed ? (
                <ChevronRight size={16} aria-hidden="true" />
              ) : (
                <ChevronLeft size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <nav
          aria-label="Menu principal"
          className="flex-1 p-2 space-y-1 overflow-y-auto"
        >
          {navItems
            .filter((item) => item.show)
            .map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                title={collapsed ? label : undefined}
                aria-label={label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-[10px] uppercase tracking-[0.18em] font-semibold focus-visible:outline-2 focus-visible:outline-accent ${
                    isActive
                      ? "bg-accent text-on-accent font-bold shadow-md"
                      : "text-text-muted hover:bg-hover hover:text-text border border-transparent hover:border-border"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon size={16} aria-hidden="true" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {!collapsed && (
            <div className="text-xs text-text-muted">
              {user?.nome} ({role})
            </div>
          )}
          <button
            onClick={logout}
            aria-label="Sair"
            title={collapsed ? "Sair" : undefined}
            className={`w-full text-sm text-text-muted hover:text-text hover:bg-hover rounded px-2 py-1.5 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-accent ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={16} aria-hidden="true" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex-1 overflow-auto p-8 bg-canvas"
        role="main"
      >
        <Outlet />
      </main>
    </div>
  );
}
