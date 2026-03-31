
# Sileo - Svelte

## Installation

```bash
npm install agnostic-sileo
```

## Basic Usage

```svelte
<script>
  import { sileoToasts, showSileoToast } from 'agnostic-sileo/dist/agnostic-sileo';
  showSileoToast({ title: 'Hello Svelte', type: 'warning' });
</script>

{#each $sileoToasts as toast}
  <div>{toast.title}</div>
{/each}
```

## Available Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced Example

```svelte
<script>
  import { showSileoToast } from 'agnostic-sileo/dist/agnostic-sileo';
  showSileoToast({
    title: 'With action',
    description: 'Press the button',
    type: 'action',
    button: {
      title: 'OK',
      onClick: () => alert('OK!')
    },
    fill: '#ffe0e0',
    roundness: 18,
    duration: 3500
  });
</script>
```
