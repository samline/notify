import { writable } from 'svelte/store';
import { sileo, ToastItem } from '../core/index';

export const toasts = writable<ToastItem[]>([]);

export function initSileoStore() {
  const unsub = sileo.subscribe((items: ToastItem[]) => toasts.set(items));
  return unsub;
}
