# Entrypoints and module formats

Choose one primary JavaScript surface for an integration and load the stylesheet separately.

## Decision table

| Use case            | Load                                           | Global side effect       | Auto-mount |
| ------------------- | ---------------------------------------------- | ------------------------ | ---------- |
| ESM or TypeScript   | `import { toast } from '@samline/notify'`      | None                     | No         |
| CommonJS            | `require('@samline/notify')`                   | None                     | No         |
| Namespaced registry | `import { browser } from '@samline/notify'`    | None                     | No         |
| Browser subpath     | `import Notify from '@samline/notify/browser'` | None                     | No         |
| Script tag / CDN    | `dist/browser/global.global.js`                | Installs `window.Notify` | Yes        |

## Root entrypoint

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster()
toast.success('Saved')
```

The root is side-effect free. It exports the complete API, public types, constants, the `browser` registry, and advanced state helpers without installing a global or touching the DOM. CommonJS consumers receive the same public surface.

## Registry modules

The root `browser` export and the default/named export of `@samline/notify/browser` expose the same `NotifyApi` shape. Module imports do not install `window.Notify` or auto-mount.

```ts
import Notify, { browser } from '@samline/notify/browser'

Notify.createToaster()
Notify.toast.info('Ready')
console.log(Notify === browser) // true
```

## Standalone IIFE

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@latest/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@latest/dist/browser/global.global.js"></script>
<script>
  window.Notify.toast.success('Saved')
</script>
```

The IIFE installs `window.Notify` and mounts the singleton when the body is ready. Pin a real published version in production and keep CSS and JavaScript versions aligned.

## Next steps

- [Browser usage](browser.md)
- [Getting started](getting-started.md)
- [TypeScript reference](typescript.md)
