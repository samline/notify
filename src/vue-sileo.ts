// Wrapper Vue para Sileo
// Provee un composable y componente básico para Vue 3
import { ref, onUnmounted } from "vue";
import { sileoCore, SileoOptions } from "./core/sileo-core";

export function useSileoToasts() {
  const toasts = ref(sileoCore.getToasts());
  const unsub = sileoCore.subscribe((t) => (toasts.value = t));
  onUnmounted(unsub);
  return { toasts };
}

export function showSileoToast(options) {
  return sileoCore.show(options);
}

// Ejemplo de componente Vue (solo lógica, UI a definir por el usuario)
// <template>
//   <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
// </template>
// <script setup>
// import { useSileoToasts } from './vue-sileo';
// const { toasts } = useSileoToasts();
// </script>
