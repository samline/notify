<script>
  import { onDestroy } from 'svelte';
  import { notifyToasts } from './svelte-notify';
  import { notifyCore } from './core/notify-core';

  let unsub = null;
  let toasts = [];

  if (typeof window !== 'undefined') {
    unsub = notifyToasts.subscribe((t) => toasts = t);
  }

  onDestroy(() => unsub && unsub());

  function dismiss(id) {
    notifyCore.dismiss(id);
  }

  function handleButton(toast) {
    if (toast.button && typeof toast.button.onClick === 'function') {
      toast.button.onClick();
    }
    dismiss(toast.id);
  }
</script>

<style>
  .notify-toasts {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
  }

  .notify-toast {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    padding: 1rem 1.5rem;
    min-width: 220px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .notify-toast-title {
    font-weight: bold;
  }

  .notify-toast-description {
    font-size: 0.95em;
    color: #555;
  }

  .notify-toast-close {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
  }
</style>

<div class="notify-toasts">
  {#each toasts as toast (toast.id)}
    <div class="notify-toast {toast.type}">
      <div class="notify-toast-title">{toast.title}</div>
      {#if toast.description}
        <div class="notify-toast-description">{toast.description}</div>
      {/if}
      {#if toast.button}
        <button on:click={() => handleButton(toast)}>{toast.button.label}</button>
      {/if}
      <button class="notify-toast-close" on:click={() => dismiss(toast.id)}>&times;</button>
    </div>
  {/each}
</div>
