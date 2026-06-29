import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className={cn(
        "bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full flex flex-col",
        "border border-neutral-200/60 dark:border-neutral-800",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-md",
        size === "lg" && "max-w-lg",
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="font-bold text-[15px] text-neutral-900 dark:text-neutral-100">{title}</h2>
            {subtitle && <p className="text-[12px] text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {children}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex gap-2">
          {footer}
        </div>
      </div>
    </div>
  );
}

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  description: React.ReactNode;
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, loading, title, description }: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm border border-neutral-200/60 dark:border-neutral-800 p-6 space-y-5">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-[15px] text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onConfirm} disabled={loading}
            className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? "O'chirilmoqda..." : "O'chirish"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-neutral-200 dark:border-neutral-700 text-[13px] font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}
