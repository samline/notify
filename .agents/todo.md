# TODO

## Pendiente

- **El bundle IIFE publicado no expone el registro en `window.Notify`.** El bundle
  se compila con `format: 'iife'` y `globalName: 'Notify'`, así que el valor que
  queda en el global es el *namespace* del módulo (`{ Notify, browser, default }`) y
  no el registro. En un navegador real `window.Notify.toast` es `undefined`;
  el registro es `window.Notify.default` (o `window.Notify.Notify`).
  `test/package-smoke.mjs` no lo detecta porque evalúa el bundle con
  `dom.window.eval()` en jsdom, donde el global conserva el registro.
  Consecuencia: el uso documentado `window.Notify.toast(...)` falla en navegador.
  Verificar en Chromium antes de dar por bueno un cambio del bundle y decidir
  cómo expone el global (un `export` único o un pie de bundle que asigne el
  registro). Hasta entonces, el sitio resuelve `window.Notify.default ?? window.Notify`.
