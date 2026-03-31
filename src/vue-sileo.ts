// Vue wrapper for Sileo
// Provides a composable and basic component for Vue 3
import { ref, onUnmounted } from "vue";
import { sileoCore, SileoOptions } from "./core/sileo-core";

export function useSileoToasts() {
  const toasts = ref(sileoCore.getToasts());
  const unsub = sileoCore.subscribe((t) => (toasts.value = t));
  onUnmounted(unsub);
  return { toasts };
}

export function showSileoToast(options: SileoOptions) {
  return sileoCore.show(options);
}

// Example Vue component (logic only, UI to be defined by the user)
// <template>
//   <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
// </template>
// <script setup>
// import { useSileoToasts } from './vue-sileo';
// const { toasts } = useSileoToasts();
// </script>
