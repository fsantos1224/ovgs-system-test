import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Modal } from "../components/Modal";

export type ConfirmVariant = "default" | "danger";

export interface ConfirmOptions {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type Resolver = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

interface PendingState extends ConfirmOptions {
  resolve: Resolver;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setPending((current) => {
        current?.resolve(result);
        return null;
      });
    },
    [],
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={pending !== null}
        title={pending?.title ?? ""}
        onClose={() => close(false)}
      >
        {pending && (
          <div className="space-y-5">
            <div className="text-sm text-text-muted">{pending.body}</div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => close(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                {pending.cancelLabel ?? "Cancelar"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={
                  pending.variant === "danger"
                    ? "px-4 py-2 bg-rose-600 text-white border border-rose-600 hover:bg-rose-700 hover:border-rose-700 rounded-lg text-[10px] uppercase tracking-wider font-bold focus-visible:outline-2 focus-visible:outline-rose-400 transition-colors"
                    : "px-4 py-2 bg-accent text-on-accent hover:opacity-90 rounded-lg text-[10px] uppercase tracking-wider font-bold focus-visible:outline-2 focus-visible:outline-accent transition-opacity"
                }
              >
                {pending.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm deve ser usado dentro de <ConfirmProvider>");
  }
  return ctx.confirm;
}
