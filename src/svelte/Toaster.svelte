<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { toasts, initSileoStore } from './store';
  import type { ToastItem, SileoOptions } from '../core/index';
  import { sileo } from '../core/index';
  import { animate } from 'motion';

  export let position: string = 'top-right';
  export let offset: number | string | { top?: number; right?: number; bottom?: number; left?: number } = 0;
  export let options: Partial<SileoOptions> = {};
  export let theme: 'light' | 'dark' | 'system' | undefined = undefined;

  let unsubscribe: () => void;
  let items: ToastItem[] = [];

  onMount(() => {
    unsubscribe = toasts.subscribe((v) => (items = v.filter((t) => (t.options.position || 'top-right') === position)));
    try { initSileoStore(); } catch (e) {}
    if (options) (sileo as any)._globalOptions = options;
    if (theme) (sileo as any)._theme = theme;
    // Inyectar SVG gooey filter solo una vez
    if (!document.getElementById('sileo-gooey-svg')) {
      const div = document.createElement('div');
      div.id = 'sileo-gooey-svg';
      div.style.position = 'absolute';
      div.style.width = '0';
      div.style.height = '0';
      div.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="sileo-gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></svg>`;
      document.body.appendChild(div);
    }
    return () => {
      if (options) delete (sileo as any)._globalOptions;
      if (theme) delete (sileo as any)._theme;
    };
  });
  onDestroy(() => { unsubscribe && unsubscribe(); });

  export function animateIn(node: HTMLElement) {
    try {
      const a = animate(node, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0px)'] }, { duration: 0.2 });
      return { destroy() {} };
    } catch (e) { return { destroy() {} }; }
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

  $: offsetStyle = (() => {
    if (typeof offset === 'number' || typeof offset === 'string') {
      return `margin: ${typeof offset === 'number' ? offset + 'px' : offset}`;
    } else if (typeof offset === 'object') {
      let s = '';
      if (offset.top !== undefined) s += `margin-top: ${offset.top}px;`;
      if (offset.right !== undefined) s += `margin-right: ${offset.right}px;`;
      if (offset.bottom !== undefined) s += `margin-bottom: ${offset.bottom}px;`;
      if (offset.left !== undefined) s += `margin-left: ${offset.left}px;`;
      return s;
    }
    return '';
  })();
</script>

<style>
  /* rely on global sileo styles */
</style>

<div class="sileo-toaster" data-position={position} data-theme={theme} style={offsetStyle}>
  {#if items && items.length}
    {#each items as t (t.id)}
      <div
        class="sileo-toast"
        data-type={t.options.type}
        data-id={t.id}
        use:animateIn
        style="{t.options.fill ? `background:${t.options.fill};` : ''}{t.options.roundness ? `border-radius:${t.options.roundness}px;--sileo-roundness:${t.options.roundness}px;` : ''}filter:url(#sileo-gooey);"
      >
        <span class={t.options.styles?.badge ? `sileo-toast-badge ${t.options.styles.badge}` : 'sileo-toast-badge'} style={t.options.fill ? `background:${t.options.fill}` : ''} data-sileo-badge>
          {#if t.options.icon}
            {@html typeof t.options.icon === 'string' ? t.options.icon : ''}
            {#if typeof t.options.icon !== 'string'}{t.options.icon}{/if}
          {:else}
            {#if t.options.type === 'success'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#16a34a"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>{:else if t.options.type === 'error'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#ef4444"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>{:else if t.options.type === 'info'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#2563eb"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#fff">i</text></svg>{:else if t.options.type === 'warning'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 6v4m0 3h.01" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>{:else if t.options.type === 'action'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#6366f1"/><path d="M7 10h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>{:else if t.options.type === 'loading'}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#fff" stroke-width="3" opacity=".3"/><path d="M18 10a8 8 0 1 1-8-8" stroke="#fff" stroke-width="3"/></svg>{:else}<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#2563eb"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#fff">i</text></svg>{/if}
          {/if}
        </span>
        <div style="flex:1">
          <div class={t.options.styles?.title ? `sileo-toast-header ${t.options.styles.title}` : 'sileo-toast-header'}>{t.options.title}</div>
          {#if t.options.description}
            <div class={t.options.styles?.description ? `sileo-toast-desc ${t.options.styles.description}` : 'sileo-toast-desc'}>{t.options.description}</div>
          {/if}
        </div>
        {#if t.options.button}
          <button class={t.options.styles?.button ? `sileo-toast-btn ${t.options.styles.button}` : 'sileo-toast-btn'} on:click|stopPropagation={(e) => { t.options.button && typeof t.options.button.onClick === 'function' ? t.options.button.onClick() : undefined; handleDismiss(t.id, e); }}>{t.options.button.title}</button>
        {/if}
        <button class="sileo-toast-close" on:click={(e) => handleDismiss(t.id, e)}>×</button>
      </div>
    {/each}
  {/if}
</div>
