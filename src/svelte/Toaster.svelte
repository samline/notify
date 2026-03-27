<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { toasts, initSileoStore } from './store';
  import type { ToastItem } from '../core/index';
  import { sileo } from '../core/index';
  import { animate } from 'motion';

  let unsubscribe: () => void;
  let items: ToastItem[] = [];

  onMount(() => {
    // subscribe local items to avoid $store auto-subscription issues
    unsubscribe = toasts.subscribe((v) => (items = v));
    // also initialize sileo store subscription helper if present
    try {
      initSileoStore();
    } catch (e) {
      // no-op
    }
  });

  onDestroy(() => { unsubscribe && unsubscribe(); });

  export function animateIn(node: HTMLElement) {
    try {
      const a = animate(node, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0px)'] }, { duration: 0.2 });
      return {
        destroy() {
          // no-op
        }
      };
    } catch (e) {
      return { destroy() {} };
    }
  }

  async function handleDismiss(id: string, ev: Event) {
    const btn = ev.currentTarget as HTMLElement | null;
    const el = btn ? btn.closest('.sileo-toast') as HTMLElement | null : null;
    if (el) {
      try {
        const a = animate(el, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-8px)'] }, { duration: 0.15 });
        await (a as any).finished;
      } catch (e) { /* ignore */ }
    }
    sileo.dismiss(id);
  }
</script>

<style>
  /* rely on global sileo styles */
</style>

{#if items && items.length}
  {#each items as t (t.id)}
    <div class="sileo-toast" data-type={t.options.type} data-id={t.id} use:animateIn>
      <div style="flex:1">
        <div class="sileo-toast-header">{t.options.title}</div>
        {#if t.options.description}
          <div class="sileo-toast-desc">{t.options.description}</div>
        {/if}
      </div>
      {#if t.options.button}
        <button class="sileo-toast-btn" on:click|stopPropagation={(e) => { t.options.button && typeof t.options.button.onClick === 'function' ? t.options.button.onClick() : undefined; handleDismiss(t.id, e); }}>{t.options.button.title}</button>
      {/if}
      <button class="sileo-toast-close" on:click={(e) => handleDismiss(t.id, e)}>×</button>
    </div>
  {/each}
{/if}
