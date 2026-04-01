// Vue wrapper for Notify
// Provides a composable and basic component for Vue 3
import { ref, onUnmounted } from "vue";
import { notifyCore, NotifyOptions } from "./core/notify-core";

export function useNotifyToasts() {
  const toasts = ref(notifyCore.getToasts());
  const unsub = notifyCore.subscribe((t) => (toasts.value = t));
  onUnmounted(unsub);
  return { toasts };
}

export function showNotifyToast(options: NotifyOptions) {
  return notifyCore.show(options);
}
