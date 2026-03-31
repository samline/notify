<script>
  import { onDestroy } from 'svelte';
  import { sileoToasts } from './svelte-sileo';
  import { sileoCore } from './core/sileo-core';
  let unsub = null;
  let toasts = [];
  unsub = sileoToasts.subscribe((t) => toasts = t);
  onDestroy(() => unsub && unsub());
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

<style>
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

<div class="sileo-toasts">
  {#each toasts as toast (toast.id)}
    <div class="sileo-toast {toast.type}">
      <div class="sileo-toast-title">{toast.title}</div>
      {#if toast.description}
        <div class="sileo-toast-description">{toast.description}</div>
      {/if}
      {#if toast.button}
        <button on:click={() => handleButton(toast)}>{toast.button.label}</button>
      {/if}
      <button class="sileo-toast-close" on:click={() => dismiss(toast.id)}>×</button>
    </div>
  {/each}
</div>
