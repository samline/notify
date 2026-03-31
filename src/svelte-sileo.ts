// Svelte wrapper for Sileo
// Provides a store and function to show toasts in Svelte
import { writable } from "svelte/store";
import { sileoCore, SileoOptions } from "./core/sileo-core";

export const sileoToasts = writable(sileoCore.getToasts());

const unsub = sileoCore.subscribe((t) => sileoToasts.set(t));

export function showSileoToast(options: SileoOptions) {
  return sileoCore.show(options);
}


