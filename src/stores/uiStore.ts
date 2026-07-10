import { create } from "zustand";

type Theme = "dark" | "light";

interface UIState {
  theme: Theme;
  /** Desktop sidebar collapsed state */
  sidebarOpen: boolean;
  /** Mobile drawer open state */
  mobileMenuOpen: boolean;
  setTheme: (t: Theme) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("XPTO:theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024;
}

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  sidebarOpen: !isMobile(),
  mobileMenuOpen: false,
  setTheme: (theme) => {
    localStorage.setItem("XPTO:theme", theme);
    document.documentElement.dataset.theme = theme;
    set({ theme });
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}));
