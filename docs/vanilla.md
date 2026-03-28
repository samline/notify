# Vanilla JS

Use the vanilla adapter for plain JavaScript projects, either with modules or directly via CDN.

## Quick start (ESM / npm)

```ts
import { notify, initToasters } from '@samline/notify/vanilla';
initToasters(document.body, ['top-right']);
notify({ title: 'Saved', description: 'Your changes have been saved', type: 'success' });
```

## Quick start (CDN / UMD)

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.14/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.1.14/dist/notify.umd.js"></script>
<script>
	document.addEventListener('DOMContentLoaded', () => {
		const api = window.notify;
		api.initToasters(document.body, ['top-right']);
		api.notify({ title: 'Saved', description: 'Your changes have been saved', type: 'success' });
	});
</script>
```

## API

```ts
// Core controller (primary: `notify`, compatibility alias: `sileo`)
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

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `options` | object | Toast creation options (see Options below) |

### Returns

`string | void` — `show` returns a toast id when created.

## Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Toast title |
| `description` | `string` | — | Optional body text |
| `type` | `info\|success\|error\|warning` | `info` | Visual intent |
| `position` | `string` | `top-right` | Container position |
| `duration` | `number` | `4000` | Auto-dismiss timeout in ms (`null` = sticky) |
| `button` | `{ title, onClick }` | — | Optional action button |

## Tips

- Always include the stylesheet for correct appearance.
- Use the ESM build for modern projects, or the UMD build for legacy/static sites.
```

### Promise flow

```ts
notify.promise(fetch('/api/save'), {
	loading: { title: 'Saving...' },
	success: { title: 'Done', type: 'success' },
	error: { title: 'Failed', type: 'error' }
import { notify, initToasters } from '@samline/notify/vanilla'; // Import from '@samline/notify/vanilla'
```

## When to use

Use the vanilla entry when you interact directly with DOM nodes or need a framework-agnostic API.

## Accessibility

Toaster containers use `role="status"` and `aria-live="polite"` by default. Respect `prefers-reduced-motion` in your UI.
