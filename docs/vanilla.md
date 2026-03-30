
# Vanilla JS (Bundler/Import)

Use the vanilla adapter for plain JavaScript projects with a bundler (Vite, Webpack, etc) or Node.js ESM/CJS. This entrypoint provides full API and advanced options.

## Quick start (ESM / npm)

```js
import { notify, initToasters } from '@samline/notify/vanilla';
initToasters(document.body, ['top-right']);
notify.success({ title: 'Saved', description: 'Your changes have been saved' });
```

## Methods: Full Examples

```js
// Show a generic toast
notify.show({ title: 'Hello', description: 'Generic toast', type: 'info' });

// Success toast
notify.success({ title: 'Success!', description: 'Operation completed.' });

// Error toast
notify.error({ title: 'Error', description: 'Something went wrong.' });

// Info toast
notify.info({ title: 'Heads up!', description: 'This is an info toast.' });

// Warning toast
notify.warning({ title: 'Warning!', description: 'Be careful.' });

// Action toast with button
notify.action({
	title: 'Action required',
	description: 'Click the button to proceed.',
	button: { title: 'Proceed', onClick: () => alert('Action!') }
});

// Promise toast (loading, success, error, action)
notify.promise(fetch('/api/save'), {
	loading: { title: 'Saving...' },
	success: { title: 'Saved!', description: 'Your data was saved.' },
	error: { title: 'Failed', description: 'Could not save.' },
	action: { title: 'Retry?', button: { title: 'Retry', onClick: () => {/* retry logic */} } }
});

// Dismiss a toast by id
const id = notify.success({ title: 'Dismiss me' });
notify.dismiss(id);

// Clear all toasts
notify.clear();

// Clear only a position
notify.clear('top-right');
```

## Advanced Toaster Options

You can pass advanced options to `initToasters`:

```js
initToasters(document.body, ['top-right'], {
	offset: { top: 32, right: 16 },
	options: { fill: '#222', roundness: 20 },
	theme: 'dark'
});
```

### Example: Multiple positions and custom offset

```js
initToasters(document.body, ['top-right', 'bottom-left'], {
	offset: { top: 24, right: 24, bottom: 24, left: 24 },
	theme: 'light',
	options: { fill: '#0f1724', roundness: 18 }
});
```

## API

```js
notify.show(options)
notify.success(options)
notify.error(options)
notify.info(options)
notify.warning(options)
notify.action(options)
notify.promise(promise, { loading, success, error, action })
notify.dismiss(id)
notify.clear()
```

## Options: Full Examples

```js
// Custom icon (SVG string)
notify.success({
	title: 'With Icon',
	icon: '<svg width="16" height="16" ...>...</svg>'
});

// Custom fill color
notify.info({
	title: 'Colored',
	fill: '#2563eb'
});

// Custom styles for sub-elements
notify.success({
	title: 'Styled',
	styles: {
		title: 'my-title-class',
		badge: 'my-badge-class',
		button: 'my-btn-class'
	}
});

// Custom roundness
notify.success({
	title: 'Rounded',
	roundness: 32
});

// Autopilot off (manual expand/collapse)
notify.success({
	title: 'Manual',
	autopilot: false
});

// Custom duration (sticky)
notify.info({
	title: 'Sticky',
	duration: null
});

// Custom position
notify.success({
	title: 'Bottom left',
	position: 'bottom-left'
});
```

### Options

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string                                 | —           | Optional body text                          |
| `type`        | `info\|success\|error\|warning\|action`| `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | Container position                          |
| `duration`    | number \| null                         | `4000`      | Auto-dismiss timeout in ms (`null` = sticky)|
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |
| `icon`        | string                                 | —           | Custom icon (SVG or HTML)                   |
| `fill`        | string                                 | —           | Custom background color (SVG or badge)      |
| `styles`      | { title, description, badge, button }  | —           | Custom class overrides for sub-elements     |
| `roundness`   | number                                 | 16          | Border radius in pixels                     |
| `autopilot`   | boolean \| object                      | true        | Auto expand/collapse timing                 |

---

# Browser / CDN (No Bundler)

If you are not using a bundler, use the [Browser guide](./browser.md) for CDN usage. Example:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.15/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.1.15/dist/notify.umd.js"></script>
<script>
	document.addEventListener('DOMContentLoaded', () => {
		const api = window.notify;
		api.initToasters(document.body, ['top-right']);
		api.notify({ title: 'Saved', description: 'Your changes have been saved', type: 'success' });
	});
</script>
```

> The CDN/UMD build exposes `window.notify` and only supports string/HTML for icons and content. For advanced options, use the import/bundler version.
| `button` | `{ title, onClick }` | — | Optional action button |

## Tips

- Always include the stylesheet for correct appearance.
- Use the ESM build for modern projects, or the UMD build for legacy/static sites.

## Customizing Styles

- Override CSS variables in your stylesheet or inline:

```css
:root {
  --sileo-bg: #18181b;
  --sileo-success: #22c55e;
  --sileo-error: #ef4444;
  --sileo-info: #2563eb;
  --sileo-warning: #f59e0b;
}
```

- Add custom classes via the `styles` option for title, badge, button, description.

## Accessibility

- Toast containers use `role="status"` and `aria-live="polite"`.
- Respects `prefers-reduced-motion` for users with motion sensitivity.

## Common Errors & Troubleshooting

- **No styles?** Make sure to import or link `dist/styles.css`.
- **No animation?** Check that the `motion` dependency is installed for ESM/bundler usage.
- **Button not working?** Ensure your `onClick` is a function and not a string.
- **Nothing appears?** Confirm you called `initToasters` and are using the correct container.

## Migration & Best Practices

- If migrating from Sileo, all options and methods are compatible.
- Use the ESM/bundler version for full feature support.
- Prefer using `notify.success`, `notify.error`, etc. for intent clarity.
- Use `notify.clear()` to remove all toasts, or pass a position to clear only one area.

---

For framework-specific usage, see the React, Vue, and Svelte guides.
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
