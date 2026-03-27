# Browser (UMD / no-bundler)

Quick start

Include the UMD bundle and stylesheet in a static page:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.7/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.1.7/dist/notify.umd.js"></script>
<script>
  const api = window.notify || window.notifications;
  api.initToasters(document.body, ['top-right']);
  // convenience: api.notify
  api.notify({ title: 'Hello', description: 'No-bundler usage', type: 'info' });
</script>
```

Notes

- The UMD bundle exposes `window.notify` (preferred). For compatibility it also exposes `window.notifications` with the previous API shape.
- Make sure to load `dist/styles.css` for styles and animations.

## CDN / Browser

Use the browser build when your project loads scripts directly in the page and cannot compile npm modules (Shopify, WordPress, plain HTML templates).

Example using the UMD build (replace path/version as needed):

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.7/dist/styles.css">
<script src="https://unpkg.com/@samline/notify@0.1.7/dist/notify.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const api = window.notify || window.notifications;
    api.initToasters(document.body, ['top-right']);
    api.notify({ title: 'Hello', description: 'No-bundler usage', type: 'info' });
  });
</script>
```

### Notes

The browser bundle exposes `window.notify` (preferred) and for compatibility also exposes `window.notifications`; if these globals conflict with other scripts use the module builds instead.
Include `dist/styles.css` for styles and animations when using the UMD/browser bundle.
