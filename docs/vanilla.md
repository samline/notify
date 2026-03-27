# Vanilla

## Quick Start

Import and initialize the vanilla (DOM) renderer:

```ts
import { notify, sileo, initToasters } from '@samline/notify/vanilla';

// Mount the containers (defaults to document.body)
initToasters(document.body, ['top-right']);

// Show a notification (use `notify(...)` as the recommended API)
notify({ title: 'Saved', description: 'Your changes have been saved', type: 'success' });
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

## Examples

### Basic

```ts
import { notify, initToasters } from '@samline/notify/vanilla';
initToasters();
notify.success({ title: 'Saved' });
```

### Promise flow

```ts
notify.promise(fetch('/api/save'), {
	loading: { title: 'Saving...' },
	success: { title: 'Done', type: 'success' },
	error: { title: 'Failed', type: 'error' }
});
```

## When to use

Use the vanilla entry when you interact directly with DOM nodes or need a framework-agnostic API.

## Accessibility

Toaster containers use `role="status"` and `aria-live="polite"` by default. Respect `prefers-reduced-motion` in your UI.
