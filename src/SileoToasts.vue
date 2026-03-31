<template>
  <div class="sileo-toasts">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="sileo-toast"
      :class="toast.type"
    >
      <div class="sileo-toast-title">{{ toast.title }}</div>
      <div v-if="toast.description" class="sileo-toast-description">{{ toast.description }}</div>
      <button v-if="toast.button" @click="handleButton(toast)">{{ toast.button.label }}</button>
      <button class="sileo-toast-close" @click="dismiss(toast.id)">×</button>
    </div>
  </div>
</template>

<script setup>
import { useSileoToasts, showSileoToast } from './vue-sileo';
import { sileoCore } from './core/sileo-core';
const { toasts } = useSileoToasts();

function dismiss(id) {
  sileoCore.dismiss(id);
}
function handleButton(toast) {
  if (toast.button && typeof toast.button.onClick === 'function') {
    toast.button.onClick();
  }
  dismiss(toast.id);
}
</script>

<style scoped>
.sileo-toasts {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}
.sileo-toast {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  min-width: 220px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sileo-toast-title {
  font-weight: bold;
}
.sileo-toast-description {
  font-size: 0.95em;
  color: #555;
}
.sileo-toast-close {
  align-self: flex-end;
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}
</style>
