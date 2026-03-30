<script lang="ts">
  import Toaster from '../src/svelte/Toaster.svelte';
  import { sileo } from '../src/core';

  function showToast() {
    sileo.success({
      title: '¡Éxito!',
      description: 'Animación gooey en Svelte',
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

<Toaster position="top-right" />
<button on:click={showToast}>Mostrar toast Svelte</button>
