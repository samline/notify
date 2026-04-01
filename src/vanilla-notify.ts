import { notifyCore } from "./core/notify-core";
import type { NotifyOptions, NotifyItem } from "./core/notify-core";

export function showNotifyToast(options: NotifyOptions): string {
  const id = notifyCore.show(options);
  // ...existing code...
  // Aquí iría la lógica para mostrar el toast en el DOM si aplica
  return id;
}

export function onNotifyToastsChange(fn: (toasts: NotifyItem[]) => void): () => void {
  return notifyCore.subscribe(fn);
}
