import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./queries/queryClient";
import "./index.css";
import { initWebVitals } from "./lib/telemetry";
import { useAuthStore } from "./stores/authStore";

document.documentElement.dataset.theme = "dark";

if (import.meta.env.DEV) {
  (window as any).__login = (email: string, senha: string) =>
    useAuthStore.getState().login(email, senha);
}

// Performance monitoring via Performance Observer nativo
initWebVitals();

// Service Worker registration
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service Worker registration failed silently
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
