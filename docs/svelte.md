
# Svelte

## Quick start

Install the package:

```bash
npm install @samline/notify svelte
```

Import and initialize in your root component:

```svelte
<script>
  import Toaster, { initSileoStore } from '@samline/notify/svelte';
  initSileoStore(); // Call once in your app root

  import { notify } from '@samline/notify/svelte';
  function show() {
    notify.show({ title: 'From Svelte' });
  }
</script>

<Toaster />
<button on:click={show}>Show</button>
```

> **Note:**
> Import `@samline/notify/dist/styles.css` in your main entrypoint or HTML for correct appearance.
> CDN: `<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.15/dist/styles.css">`


## API

- `Toaster.svelte`: Renders notifications and subscribes to the core controller.
- `initSileoStore()`: Wires the notification controller to a Svelte store (call once in your app root).
- Use `notify.show({...})` or shortcut methods to trigger notifications. Import from `@samline/notify/svelte` (now available directly).

### Methods

```ts
notify.show(options)
notify.success(options)
notify.error(options)
notify.info(options)
notify.warning(options)
notify.action(options)
notify.promise(promise, { loading, success, error })
notify.dismiss(id)
notify.clear()
```

### Options

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string                                 | —           | Optional body text                          |
| `type`        | `info\|success\|error\|warning`        | `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of toast positions                      |
| `duration`    | number                                 | `4000`      | Auto-dismiss timeout in ms (0 = persistent) |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |

## Tips

- For TypeScript, use `npx svelte-check` and `npm run typecheck` during development.
- You can customize styles by overriding CSS variables or importing the stylesheet as needed.
