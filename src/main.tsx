import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initWebVitals } from "./lib/telemetry";

// Aplica tema persistido antes do React montar (evita FOUC).
document.documentElement.dataset.theme =
  localStorage.getItem("ovgs:theme") ?? "dark";

// Performance monitoring via Performance Observer nativo
initWebVitals();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
