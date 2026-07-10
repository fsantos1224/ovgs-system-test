import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      closingRef.current = false;
      el.classList.remove("modal-closing");
      el.showModal();
    }
    if (!open && el.open && !closingRef.current) {
      closingRef.current = true;
      el.classList.add("modal-closing");
      el.close();
      const onAnimEnd = () => {
        el.classList.remove("modal-closing");
        el.style.display = "";
        closingRef.current = false;
        el.removeEventListener("animationend", onAnimEnd);
      };
      el.addEventListener("animationend", onAnimEnd);
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => {
      if (!closingRef.current) onClose();
    };
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-2xl border border-border w-full max-w-lg bg-surface text-text shadow-2xl backdrop:bg-overlay p-0 fixed inset-0 m-auto h-fit max-h-[90vh] overflow-y-auto modal-bottom-sheet"
      aria-labelledby="modal-title"
    >
      <div className="p-5 md:p-6 border-b border-border bg-surface-elevated flex justify-between items-center sticky top-0 z-10">
        <h2 id="modal-title" className="text-base md:text-lg font-serif italic text-text">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="min-touch-target md:p-1.5 inline-flex items-center justify-center text-text-faint hover:text-text rounded-full hover:bg-hover transition-colors focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </dialog>
  );
}
