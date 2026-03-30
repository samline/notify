# Vue 3

## Quick start

Install the package:

```bash
npm install @samline/notify vue
```

Register the `Toaster` component in your app:

```js
import { createApp } from 'vue';
import App from './App.vue';
import { Toaster } from '@samline/notify/vue';

const app = createApp(App);
app.component('Toaster', Toaster);
app.mount('#app');
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



Use the `notify` controller to show notifications:

```js
import { notify } from '@samline/notify/vue';
notify.show({ title: 'Hello from Vue' });
```

Or access it globally in any component via `this.$notify` (if you use the plugin install):

```js
this.$notify.show({ title: 'From global' });
```

In your template:

```vue
<template>
	<Toaster />
	<button @click="show">Show</button>
</template>

<script setup>
import { notify } from '@samline/notify/vue';
function show(){ notify.show({ title: 'Hello from Vue' }); }
</script>
```

> **Note:**
> Import `@samline/notify/dist/styles.css` in your main entrypoint or HTML for correct appearance.



## API

- `Toaster`: Main visual component (same as in React and Svelte).
- `notify`: Programmatic controller for showing notifications. Import from `@samline/notify/vue` or use `this.$notify` if using the plugin.

### Options

All notification methods accept advanced options:

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string \| VNode                        | —           | Optional body text (HTML or string)         |
| `type`        | `info\|success\|error\|warning\|action`| `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of the valid positions. If you only initialize one position with `<Toaster position="..." />`, toasts without an explicit position will go there (dynamic fallback). If you initialize multiple, the fallback is `top-right`. |
| `duration`    | number \| null                         | `4000`      | Auto-dismiss timeout in ms (null = sticky)  |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |
| `icon`        | string \| VNode                        | —           | Custom icon (SVG or node)                   |
| `fill`        | string                                 | —           | Custom background color (SVG or badge)      |
| `styles`      | { title, description, badge, button }  | —           | Custom class overrides for sub-elements     |
| `roundness`   | number                                 | 16          | Border radius in pixels                     |
| `autopilot`   | boolean \| object                      | true        | Auto expand/collapse timing                 |

#### Example: Advanced Toasts

```js
// Custom icon (SVG string or VNode)
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

// Custom position (make sure you initialized that position with <Toaster position="bottom-left" />)
notify.success({
	title: 'Bottom left',
	position: 'bottom-left'
});
---

## ⚠️ Warnings and Best Practices

- If you only use one `<Toaster position="..." />`, toasts without an explicit position will go there automatically (dynamic fallback).
- If you use multiple `<Toaster position="..." />`, the fallback will be `top-right`.
- If you notify to a position that was not initialized, you will see a warning in the console and the toast will not be shown.

// Description as VNode
notify.info({
	title: 'VNode Description',
	description: h('span', { style: 'color: red' }, 'Custom VNode content')
});
```

#### Example: Advanced Toast

```js
notify.success({
	title: "Styled!",
	fill: "#222",
	icon: '<svg>...</svg>',
	styles: {
		title: "text-white!",
		badge: "bg-white/20!",
		button: "bg-white/10!"
	},
	roundness: 24,
	autopilot: false
});
```

#### Promise Toasts

```js
notify.promise(fetchData(), {
	loading: { title: "Loading..." },
	success: (data) => ({ title: `Loaded ${data.name}` }),
	error: (err) => ({ title: "Error", description: err.message }),
	action: (data) => ({ title: "Action required", button: { title: "Retry", onClick: () => retry() } })
});
```

### Toaster Component Props

The `<Toaster />` component accepts the following props:

| Prop      | Type                                      | Default      | Description                                 |
| --------- | ----------------------------------------- | ------------ | ------------------------------------------- |
| `position`| string                                    | top-right    | Default toast position                      |
| `offset`  | number \| string \| {top,right,bottom,left}| 0            | Distance from viewport edges                |
| `options` | Partial<Options>                          | —            | Default options for all toasts              |
| `theme`   | "light" \| "dark" \| "system"            | system       | Color scheme (auto, light, dark)            |

#### Example: Custom Toaster

```vue
<Toaster position="bottom-center" :offset="24" theme="dark" :options="{ fill: '#222', roundness: 20 }" />
```

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
- **Nothing appears?** Confirm you rendered `<Toaster />` and are using the correct import.

## Migration & Best Practices

- If migrating from Sileo, all options and methods are compatible.
- Prefer using `notify.success`, `notify.error`, etc. for intent clarity.
- Use `notify.clear()` to remove all toasts, o pasar una posición para limpiar solo un área.

---

For other frameworks, see the React, Svelte, and Vanilla guides.
- Advanced: The `Notifications` plugin is available for global/legacy registration, but direct use of `Toaster` is recommended for most apps.
- `useSileo()`: Composable that returns the `sileo` controller if you prefer.

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

- The Vue adapter integrates with the Vue lifecycle and works with Vue 3's Composition API.
- You can customize appearance by importing the stylesheet or overriding CSS variables.
```
