# Sileo - Svelte

## Instalación

```bash
npm install agnostic-sileo
```

## Uso básico

```svelte
<script>
  import { sileoToasts, showSileoToast } from 'agnostic-sileo/dist/agnostic-sileo';
  showSileoToast({ title: 'Hola Svelte', type: 'warning' });
</script>

{#each $sileoToasts as toast}
  <div>{toast.title}</div>
{/each}
```

## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [API general](../README.md#api-general))

## Ejemplo avanzado

```svelte
<script>
  import { showSileoToast } from 'agnostic-sileo/dist/agnostic-sileo';
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
