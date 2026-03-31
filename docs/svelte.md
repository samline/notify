npm install @samline/notify/svelte

# Notify - Svelte

## Installation

```bash
npm install @samline/notify/svelte
```

## Basic usage

### UI Plug-and-play

```svelte
<script>
  import SileoToasts, { sileoToasts, showSileoToast } from '@samline/notify/svelte';
</script>
<SileoToasts />
```

### Manual usage (store)

```svelte
<script>
  import { sileoToasts, showSileoToast } from '@samline/notify/svelte';
  showSileoToast({ title: 'Hello Svelte', type: 'warning' });
</script>

{#each $sileoToasts as toast}
  <div>{toast.title}</div>
```

## Available options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced example

```svelte
<script>
  import { showSileoToast } from '@samline/notify/svelte';
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
