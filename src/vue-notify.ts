// Vue wrapper for Notify
// Provides a composable and basic component for Vue 3
import { getCurrentInstance, onUnmounted, ref } from "vue";
import { notifyCore, NotifyOptions } from "./core/notify-core";

export function useNotifyToasts() {
  const toasts = ref(notifyCore.getToasts());
  const unsub = notifyCore.subscribe((t) => (toasts.value = t));

  // In tests the composable can run outside a component setup function.
  // Register lifecycle cleanup only when there is an active Vue instance.
  if (getCurrentInstance()) {
    onUnmounted(unsub);
  }

  return { toasts };
}

export function showNotifyToast(options: NotifyOptions) {
  return notifyCore.show(options);
}
