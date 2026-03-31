
# Browser / CDN usage

Use this package directly in the browser when you cannot use npm modules or a bundler (e.g. Shopify, WordPress, static HTML).

## Quick start

Add the stylesheet and UMD bundle to your HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.2.5/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.2.5/dist/notify.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const api = window.notify; // or window.notifications for legacy
    // Always use an array of strings as the second argument
    // Correct usage:
    api.initToasters(document.body, ['top-left']);
    api.notify({ title: 'Hello', description: 'No-bundler usage', type: 'info' });
  });
</script>
```



## API

- The UMD bundle exposes `window.notify` (recommended) and `window.notifications` (legacy/compatibility).
- Always include `dist/styles.css` for correct appearance and animations.
- Use `api.initToasters(container, positions, { offset, options, theme })` to mount containers (usually `document.body`).
- Use `api.notify({...})` to show a notification.

### ⚠️ Warnings and Best Practices

- The second argument to `initToasters` **must be an array of strings** (e.g. `['top-left']`).
- **Do not use** `document.body['top-left']` (this is `undefined` and will not work).
- If you initialize only one position, toasts without an explicit position will go there automatically (dynamic fallback).
- If you initialize multiple positions, toasts without an explicit position will go to `'top-right'` by default.
- If you notify to a position that was not initialized, you will see a warning in the console and the toast will not be shown.

### Advanced Options

<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.2.5/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.2.5/dist/notify.umd.js"></script>
| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string                                 | —           | Optional body text (HTML or string)         |
| `type`        | `info\|success\|error\|warning\|action`| `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of toast positions                      |
| `duration`    | number \| null                         | `4000`      | Auto-dismiss timeout in ms (null = sticky)  |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |
| `icon`        | string                                 | —           | Custom icon (SVG or HTML)                   |
| `fill`        | string                                 | —           | Custom background color (SVG or badge)      |
| `styles`      | { title, description, badge, button }  | —           | Custom class overrides for sub-elements     |
| `roundness`   | number                                 | 16          | Border radius in pixels                     |
| `autopilot`   | boolean \| object                      | true        | Auto expand/collapse timing                 |
    <script src="https://unpkg.com/@samline/notify@0.2.5/dist/notify.umd.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.2.5/dist/styles.css" />

```js
api.success({
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

### Toaster Options


You can pass advanced options to `initToasters`:

```js
// Correct example with multiple positions
api.initToasters(document.body, ['top-right', 'bottom-left'], {
  offset: { top: 32, right: 16 },
  options: { fill: '#222', roundness: 20 },
  theme: 'dark'
});
```

## Notes

- If you need more control or want to avoid global variables, use the ESM/CJS builds with a bundler.
