# Svelte

Quick start
# Svelte

Quick start

```bash
npm install @samline/notify svelte
```

Usage

```svelte
<script>
  import Toaster, { initSileoStore } from '@samline/notify/svelte';
  initSileoStore();
</script>

<Toaster />

<button on:click={() => import('@samline/notify').then(m => m.notify.show({ title: 'Svelte' }))}>Show</button>
```

TypeScript

If you use TypeScript, run `npm run typecheck` and `npx svelte-check` during development.

## API

- `Toaster.svelte` — component that renders toasts and subscribes to the core controller.
- `initSileoStore()` — helper to wire the core `notify`/`sileo` controller to a Svelte store.

## Examples

```svelte
<script>
  import Toaster, { initSileoStore } from '@samline/notify/svelte';
  initSileoStore();
  function show(){ import('@samline/notify').then(m => m.notify.show({ title: 'From Svelte' })); }
</script>

<Toaster />
<button on:click={show}>Show</button>
```

## Notes

- Use `npx svelte-check` and `npm run typecheck` when developing with TypeScript.
- The Svelte adapter is lightweight and subscribes to the shared core controller; use `initSileoStore()` in your app root to wire the store.
