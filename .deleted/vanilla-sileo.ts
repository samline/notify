import { notifyCore } from "./core/notify-core";
import type { NotifyOptions, NotifyItem } from "./core/notify-core";

export function showNotifyToast(options: NotifyOptions): string {
  const id = notifyCore.show(options);
  const toast = document.createElement("div");
  toast.className = "notify-toast";
  toast.innerText = options.title || options.type || "Toast";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    notifyCore.dismiss(id);
  }, options.duration || 3000);
  return id;
}

export function onNotifyToastsChange(fn: (toasts: NotifyItem[]) => void): () => void {
  return notifyCore.subscribe(fn);
}
