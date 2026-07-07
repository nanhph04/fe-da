export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export type ToastItem = ToastInput & {
  id: number;
  variant: ToastVariant;
};

export const MAX_VISIBLE_TOASTS = 4;

export function createToastItem(id: number, input: ToastInput): ToastItem {
  return {
    ...input,
    id,
    variant: input.variant ?? "info",
  };
}

export function getVisibleToasts(toasts: ToastItem[]) {
  return toasts.slice(-MAX_VISIBLE_TOASTS);
}
