import { useToastStore, type ToastVariant } from "../stores/toastStore";

const variantStyles: Record<ToastVariant, React.CSSProperties> = {
  success: { backgroundColor: "var(--toast-success-bg)", borderColor: "var(--toast-success-border)", color: "var(--toast-success-text)" },
  error: { backgroundColor: "var(--toast-error-bg)", borderColor: "var(--toast-error-border)", color: "var(--toast-error-text)" },
  warning: { backgroundColor: "var(--toast-warning-bg)", borderColor: "var(--toast-warning-border)", color: "var(--toast-warning-text)" },
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-md">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium animate-slide-up-toast"
          style={variantStyles[t.variant]}
        >
          <span className="text-base shrink-0">{variantIcons[t.variant]}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
