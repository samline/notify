
# React

## Quick start

Install the package and peer dependencies:

```bash
npm install @samline/notify react react-dom
```

Import and render the `Toaster` component in your app root:

```tsx
import React from 'react';

import { Toaster, notify } from '@samline/notify/react';

export function App() {
  return (
    <>
      <Toaster />
      <button onClick={() => notify.show({ title: 'Done', type: 'success' })}>Show</button>
    </>
  );
}
```

## Methods: Full Examples

```tsx
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

> **Note:**
> Import `@samline/notify/dist/styles.css` in your main entrypoint or include it in your HTML for correct appearance.
> CDN: `<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.15/dist/styles.css">`


## API

- `<Toaster />` subscribes to the notification controller and renders toasts.
- Use `notify.show({...})` or shortcut methods (`notify.success`, `notify.error`, `notify.info`, `notify.warning`, `notify.action`, `notify.promise`, `notify.dismiss`, `notify.clear`) to trigger notifications. Import from `@samline/notify/react`.

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

All notification methods accept advanced options:

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string \| ReactNode                    | —           | Optional body text (JSX or string)          |
| `type`        | `info\|success\|error\|warning\|action`| `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of toast positions                      |
| `duration`    | number \| null                         | `4000`      | Auto-dismiss timeout in ms (null = sticky)  |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |
| `icon`        | string \| ReactNode                    | —           | Custom icon (SVG or JSX)                    |
| `fill`        | string                                 | —           | Custom background color (SVG or badge)      |
| `styles`      | { title, description, badge, button }  | —           | Custom class overrides for sub-elements     |
| `roundness`   | number                                 | 16          | Border radius in pixels                     |
| `autopilot`   | boolean \| object                      | true        | Auto expand/collapse timing                 |

#### Example: Advanced Toasts

```tsx
// Custom icon (SVG string or JSX)
notify.success({
  title: 'With Icon',
  icon: <svg width="16" height="16" ...>...</svg>
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

// Description as ReactNode
notify.info({
  title: 'JSX Description',
  description: <span style={{ color: 'red' }}>Custom JSX content</span>
});
```

#### Example: Advanced Toast

```tsx
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

```tsx
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

```tsx
<Toaster position="bottom-center" offset={24} theme="dark" options={{ fill: '#222', roundness: 20 }} />
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
- Use `notify.clear()` to remove all toasts, or pass a position to clear only one area.

---

For other frameworks, see the Vue, Svelte, and Vanilla guides.
| `duration`    | number                                 | `4000`      | Auto-dismiss timeout in ms (0 = persistent) |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |

## Tips

- You can customize positions and styles by overriding CSS variables or importing the stylesheet in your preferred way.

## API

- `Toaster` component: mounts a toast container and subscribes to the core controller.
- Primary API: use `notify` (e.g. `notify.show(...)`). A backward-compatible `sileo` alias is also available: `sileo.show(...)`.

## Notes

- The React adapter renders toasts in a React-friendly way and is SSR-safe when used with client-only mounting.
- To customize styles, import `dist/styles.css` or override the CSS variables defined in the stylesheet.
