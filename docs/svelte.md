# Notify - Svelte

## Installation

```bash
npm install @samline/notify
```

## Basic usage

### Manual usage (store)

```svelte
<script>
  import { notifyToasts, showNotifyToast, renderNotifyToasts } from '@samline/notify/svelte';
  renderNotifyToasts({ position: 'top-right' });
  showNotifyToast({ title: 'Hello Svelte', type: 'warning' });
</script>

{#each $notifyToasts as toast}
  <div>{toast.title}</div>
{/each}
```

For a guaranteed shared visual style, use `renderNotifyToasts()`.
If you prefer a custom UI, render your own component from `$notifyToasts`.

## Available options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced example

```svelte
<script>
  import { showNotifyToast } from '@samline/notify/svelte';
  showNotifyToast({
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
