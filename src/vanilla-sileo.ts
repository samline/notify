import { sileoCore } from "./core/sileo-core";
import type { SileoOptions, SileoItem } from "./core/sileo-core";

export function showSileoToast(options: SileoOptions): string {
  const id = sileoCore.show(options);
  const toast = document.createElement("div");
  toast.className = "sileo-toast";
  toast.innerText = options.title || options.type || "Toast";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    sileoCore.dismiss(id);
  }, options.duration || 3000);
  return id;
}

export function onSileoToastsChange(fn: (toasts: SileoItem[]) => void): () => void {
  return sileoCore.subscribe(fn);
}
