declare module "*.css";

interface Window {
  notify: {
    show(options: import('./types').NotifyOptions): string;
    dismiss(id: string): void;
    clear(): void;
    subscribe(fn: (toasts: import('./core/notify-core').NotifyItem[]) => void): () => void;
  };
}