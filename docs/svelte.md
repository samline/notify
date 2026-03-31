

# Notify - Svelte


npm install @samline/notify/svelte



## Basic Usage



### UI Plug-and-play

```svelte
<script>
  import SileoToasts, { sileoToasts, showSileoToast } from '@samline/notify/svelte';
</script>
<SileoToasts />


### Uso manual (store)

```svelte
<script>
  import { sileoToasts, showSileoToast } from '@samline/notify/svelte';
  showSileoToast({ title: 'Hola Svelte', type: 'warning' });
</script>

{#each $sileoToasts as toast}
  <div>{toast.title}</div>
```


## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [General API](../README.md#general-api))


## Ejemplo avanzado

```svelte
<script>
  import { showSileoToast } from '@samline/notify/svelte';
  showSileoToast({
    title: 'Con acción',
    description: 'Presiona el botón',
    type: 'action',
    button: {
      title: 'OK',
      onClick: () => alert('¡OK!')
    },
    fill: '#ffe0e0',
    roundness: 18,
    duration: 3500
  });
</script>
```
