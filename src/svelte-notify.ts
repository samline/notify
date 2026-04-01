// Svelte wrapper for Notify
// Provides a store and function to show toasts in Svelte
import { writable } from "svelte/store";
import { notifyCore, NotifyOptions } from "./core/notify-core";

export const notifyToasts = writable(notifyCore.getToasts());

const unsub = notifyCore.subscribe((t) => notifyToasts.set(t));

export function showNotifyToast(options: NotifyOptions) {
  return notifyCore.show(options);
}
