# Browser (UMD / no-bundler)

Quick start

Incluye el UMD bundle y la hoja de estilos en una página estática:

```html
<link rel="stylesheet" href="/path/to/dist/styles.css">
<script src="/path/to/dist/notify.umd.js"></script>
<script>
  const api = window.notify || window.notifications;
  api.initToasters(document.body, ['top-right']);
  // alias: api.notify
  api.notify({ title: 'Hola', description: 'Uso sin bundler', type: 'info' });
</script>
```

Notes

- El bundle UMD expone `window.notify` (preferido). Para compatibilidad también se expone `window.notifications` con la forma previa.
- Asegúrate de cargar `dist/styles.css` para obtener estilos y animaciones.
## CDN / Browser

Use the browser build when your project loads scripts directly in the page and cannot compile npm modules (Shopify, WordPress, plain HTML templates).

Example using the UMD build (replace path/version as needed):

```html
<link rel="stylesheet" href="/path/to/dist/styles.css">
<script src="/path/to/dist/notify.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const api = window.notify || window.notifications;
    api.initToasters(document.body, ['top-right']);
    api.notify({ title: 'Hola', description: 'Uso sin bundler', type: 'info' });
  });
</script>
```

### Notes

The browser bundle exposes `window.notify` (preferred) and for compatibility also exposes `window.notifications` with the previous shape; if these globals conflict with other scripts use the module builds instead.
Include `dist/styles.css` for styles and animations when using the UMD/browser bundle.
