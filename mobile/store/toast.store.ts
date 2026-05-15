import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
};

type ToastState = {
  toasts: Toast[];
  show: (variant: ToastVariant, message: string, duration?: number) => string;
  dismiss: (id: string) => void;
};

let counter = 0;
const nextId = () => {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (variant, message, duration = 3000) => {
    const id = nextId();
    set((state) => ({ toasts: [...state.toasts, { id, variant, message, duration }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().show('success', message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().show('error', message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().show('info', message, duration),
};
