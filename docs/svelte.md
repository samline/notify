# Svelte

Quick start

```bash
npm install @samline/notify svelte
```

Uso

El paquete incluye un componente `Toaster.svelte` y un store `initSileoStore()`:

```svelte
<script>
  import Toaster, { initSileoStore } from '@samline/notify/svelte';
  initSileoStore();
</script>

<Toaster />

<button on:click={() => import('@samline/notify').then(m => m.sileo.show({ title: 'Svelte' }))}>Mostrar</button>
```

TypeScript

Si usas TypeScript, ejecuta `npm run typecheck` y `npx svelte-check` durante el desarrollo.

## API

- `Toaster.svelte` — component that renders toasts and subscribes to the core `sileo` store (compat alias).
- `initSileoStore()` — helper to wire the core `sileo`/`notify` controller to a Svelte store.

## Examples

```svelte
<script>
  import Toaster, { initSileoStore } from '@samline/notify/svelte';
  initSileoStore();
  function show(){ import('@samline/notify').then(m => m.sileo.show({ title: 'From Svelte' })); }
</script>

<Toaster />
<button on:click={show}>Mostrar</button>
```

## Notes

- Use `npx svelte-check` and `npm run typecheck` when developing with TypeScript.
- The Svelte adapter is lightweight and subscribes to the shared core controller; use `initSileoStore()` in your app root to wire the store.
