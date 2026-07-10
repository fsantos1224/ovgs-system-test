// Layout acessível: skip-to-content, landmark roles, nav semântico.
// Itens sem permissão retornam null (não renderizam, não são focáveis).
// Mobile: drawer hamburger + top app bar (< lg). Desktop: sidebar fixa.

import { useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
  Menu,
  X,
} from "lucide-react";
import { usePermissao } from "../hooks/usePermission";
import { Toaster } from "../components/Toaster";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

type Theme = "dark" | "light";

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/ovs": "Ordens de Venda",
  "/ovs/nova": "Nova Ordem",
  "/agendamento": "Agendamento",
  "/cadastros/clientes": "Clientes",
  "/cadastros/transportes": "Transportes",
  "/cadastros/itens": "Itens",
  "/auditoria": "Auditoria",
};

function getPageTitle(pathname: string): string {
  // Try exact match first, then prefix match for detail pages
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/ovs/")) return "Ordem de Venda";
  return "XPTO";
}

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user!.role;
  const {
    sidebarOpen,
    mobileMenuOpen,
    toggleSidebar,
    setMobileMenuOpen,
    theme,
    setTheme,
  } = useUIStore();

  // Hooks no topo do componente — nunca dentro de callback (Rules of Hooks).
  const canSeeOVs = usePermissao("ov:listar");
  const canSeeAgendamento = usePermissao("agendamento:ver");
  const canSeeClientes = usePermissao("clientes:listar");
  const canSeeTransportes = usePermissao("transportes:listar");
  const canSeeItens = usePermissao("itens:listar");
  const canSeeAuditoria = usePermissao("auditoria:ver");

  // Fecha drawer no Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  // Fecha drawer ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  // Trava scroll do body quando drawer está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add("scroll-locked");
    } else {
      document.body.classList.remove("scroll-locked");
    }
    return () => {
      document.body.classList.remove("scroll-locked");
    };
  }, [mobileMenuOpen]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

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

  const currentPageTitle = getPageTitle(location.pathname);

  // ----- Sidebar content (shared between desktop & mobile drawer) -----
  const sidebarContent = (inDrawer = false) => (
    <>
      {/* Logo / Brand */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-2 shrink-0">
        <div
          className={`flex flex-col leading-tight ${inDrawer || sidebarOpen ? "" : "hidden"}`}
        >
          <span className="text-[9px] tracking-[0.3em] font-bold uppercase text-text-faint">
            XPTO
          </span>
          <span className="font-serif italic text-text">Gestão</span>
        </div>
        {!inDrawer && (
          <div className="flex items-center gap-1">
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
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Colapsar menu" : "Expandir menu"}
              aria-expanded={sidebarOpen}
              className="p-1.5 rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
            >
              {sidebarOpen ? (
                <ChevronLeft size={16} aria-hidden="true" />
              ) : (
                <ChevronRight size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        )}
        {inDrawer && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fechar menu"
            className="p-1.5 rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav links */}
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
              title={!sidebarOpen && !inDrawer ? label : undefined}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-[10px] uppercase tracking-[0.18em] font-semibold focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive
                    ? "bg-accent text-on-accent font-bold shadow-md"
                    : "text-text-muted hover:bg-hover hover:text-text border border-transparent hover:border-border"
                } ${!sidebarOpen && !inDrawer ? "justify-center" : ""}`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {(sidebarOpen || inDrawer) && <span>{label}</span>}
            </NavLink>
          ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-border space-y-2 shrink-0">
        {(sidebarOpen || inDrawer) && (
          <div className="text-xs text-text-muted truncate">
            {user?.nome} ({role})
          </div>
        )}
        <button
          onClick={logout}
          aria-label="Sair"
          title={!sidebarOpen && !inDrawer ? "Sair" : undefined}
          className={`w-full text-sm text-text-muted hover:text-text hover:bg-hover rounded px-2 py-1.5 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-accent ${!sidebarOpen && !inDrawer ? "justify-center" : ""}`}
        >
          <LogOut size={16} aria-hidden="true" />
          {(sidebarOpen || inDrawer) && <span>Sair</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Skip-to-content link — primeiro elemento focável */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-surface focus:text-text focus:px-4 focus:py-2 focus:rounded focus-visible:outline-2 focus-visible:outline-accent"
      >
        Ir para o conteúdo principal
      </a>

      {/* ============================================ */}
      {/* DESKTOP SIDEBAR (lg+)                         */}
      {/* ============================================ */}
      <aside
        role="navigation"
        aria-label="Navegação principal"
        className={`hidden lg:flex flex-col bg-canvas text-text border-r border-border transition-all duration-200 shrink-0 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* ============================================ */}
      {/* MOBILE DRAWER BACKDROP (< lg)                */}
      {/* ============================================ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-overlay z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================ */}
      {/* MOBILE DRAWER (< lg)                         */}
      {/* ============================================ */}
      <aside
        role="navigation"
        aria-label="Navegação principal"
        className={`fixed top-0 left-0 h-full w-64 bg-canvas text-text border-r border-border z-50 lg:hidden flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          paddingTop: "var(--safe-area-top)",
          paddingBottom: "var(--safe-area-bottom)",
        }}
      >
        {sidebarContent(true)}
      </aside>

      {/* ============================================ */}
      {/* MAIN CONTENT AREA                            */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar (< lg) */}
        <header className="lg:hidden sticky top-0 z-30 bg-canvas/80 backdrop-blur-md border-b border-border shrink-0">
          <div className="flex items-center justify-between h-14 px-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu de navegação"
              className="min-touch-target inline-flex items-center justify-center rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text">
              {currentPageTitle}
            </span>

            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
                }
                className="min-touch-target inline-flex items-center justify-center rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
              >
                {theme === "dark" ? (
                  <Sun size={18} aria-hidden="true" />
                ) : (
                  <Moon size={18} aria-hidden="true" />
                )}
              </button>
              <button
                onClick={logout}
                aria-label="Sair"
                className="min-touch-target inline-flex items-center justify-center rounded hover:bg-hover text-text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-accent"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 lg:p-8 bg-canvas"
          role="main"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
