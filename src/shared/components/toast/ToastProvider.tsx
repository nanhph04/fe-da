"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import {
  createToastItem,
  getVisibleToasts,
  type ToastInput,
  type ToastItem,
  type ToastVariant,
} from "./toast-state";

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION_MS = 4200;

const variantClassName: Record<ToastVariant, string> = {
  info: "border-border bg-card text-foreground",
  success: "border-emerald-500/35 bg-card text-foreground",
  warning: "border-secondary/45 bg-card text-foreground",
  error: "border-destructive/45 bg-card text-foreground",
};

const variantIcon: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: XCircle,
};

function ToastCard({ toastItem, onDismiss }: { toastItem: ToastItem; onDismiss: (id: number) => void }) {
  const Icon = variantIcon[toastItem.variant];

  return (
    <div
      role="status"
      className={`pointer-events-auto overflow-hidden rounded-lg border px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${variantClassName[toastItem.variant]}`}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-headline text-sm font-black tracking-tight text-foreground">{toastItem.title}</p>
          {toastItem.description ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{toastItem.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toastItem.id)}
          className="-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Đóng thông báo"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts(current => current.filter(toastItem => toastItem.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;

    setToasts(current => getVisibleToasts([...current, createToastItem(id, input)]));
    window.setTimeout(() => dismissToast(id), input.durationMs ?? DEFAULT_DURATION_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ toast, dismissToast }), [dismissToast, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-24 z-[90] flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3"
        role="region"
        aria-label="Thông báo"
      >
        {toasts.map(toastItem => (
          <ToastCard key={toastItem.id} toastItem={toastItem} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
