
# Browser / CDN usage

Use this package directly in the browser when you cannot use npm modules or a bundler (e.g. Shopify, WordPress, static HTML).

## Quick start

Add the stylesheet and UMD bundle to your HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.15/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.1.15/dist/notify.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const api = window.notify; // or window.notifications for legacy
    api.initToasters(document.body, ['top-right']);
    api.notify({ title: 'Hello', description: 'No-bundler usage', type: 'info' });
  });
</script>
```

## API

- The UMD bundle exposes `window.notify` (recommended) and `window.notifications` (legacy/compatibility).
- Always include `dist/styles.css` for correct appearance and animations.
- Use `api.initToasters(container, positions)` to mount containers (usually `document.body`).
- Use `api.notify({...})` to show a notification.

## Notes

- If you need more control or want to avoid global variables, use the ESM/CJS builds with a bundler.
