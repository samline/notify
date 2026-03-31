// Wrapper Svelte para Sileo
// Provee un store y función para mostrar toasts en Svelte
import { writable } from "svelte/store";
import { sileoCore, SileoOptions } from "./core/sileo-core";

export const sileoToasts = writable(sileoCore.getToasts());

const unsub = sileoCore.subscribe((t) => sileoToasts.set(t));

export function showSileoToast(options) {
  return sileoCore.show(options);
}

// Limpieza automática (opcional, si usas module context)
// onDestroy(() => unsub());

// Ejemplo de uso en Svelte:
// <script>
//   import { sileoToasts, showSileoToast } from './svelte-sileo';
// </script>
// {#each $sileoToasts as toast}
//   <div>{toast.title}</div>
// {/each}
