<template>
  <div>
    <SileoToaster position="top-right" />
    <button @click="showToast">Mostrar toast Vue</button>
  </div>
</template>

<script setup>
import { sileo } from '../src/vue';

function showToast() {
  sileo.success({
    title: '¡Éxito!',
    description: 'Animación gooey en Vue',
    fill: '#171717',
    roundness: 24,
    styles: {
      title: 'text-white!',
      badge: 'bg-white/20!',
      button: 'bg-white/10!',
    },
    autopilot: true,
  });
}
</script>
