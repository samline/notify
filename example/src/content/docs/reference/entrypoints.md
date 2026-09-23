---
title: Entrypoints and module formats
description: Choose between ESM, CommonJS, the root browser registry, the browser subpath, and the standalone IIFE.
template: doc
---

Notify exposes separate surfaces for module consumers and script-tag consumers. Choose one primary surface for an integration and import the stylesheet separately.

## Decision table

| Use case                         | Load                                           | Global side effect       | Auto-mount                  |
| -------------------------------- | ---------------------------------------------- | ------------------------ | --------------------------- |
| ESM or TypeScript app            | `import { toast } from '@samline/notify'`      | None                     | No                          |
| CommonJS app                     | `require('@samline/notify')`                   | None                     | No                          |
| Registry object without a global | `import { browser } from '@samline/notify'`    | None                     | No                          |
| Browser subpath                  | `import Notify from '@samline/notify/browser'` | None                     | No                          |
| No bundler / CDN                 | `dist/browser/global.global.js`                | Installs `window.Notify` | Yes, when the body is ready |

Every visual integration also needs `@samline/notify/styles.css` or the matching `dist/styles.css` asset.

## Root entrypoint

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster()
toast.success('Saved')
```

The root is side-effect free: importing it does not install a global or touch the DOM. It exposes the complete API, public types, numeric constants, the `browser` registry object, and advanced state exports.

```js title="CommonJS"
const { createToaster, toast } = require('@samline/notify')

createToaster()
toast.success('Saved')
```

## Registry object

The root `browser` export and the default/named export of `@samline/notify/browser` are the same registry shape:

```ts
import Notify, { browser as sameRegistry } from '@samline/notify/browser'

Notify.createToaster()
Notify.toast.info('Ready')
console.log(Notify === sameRegistry) // true
```

These module imports do not assign `window.Notify` and do not auto-mount. They are useful when you prefer one namespace but still use a bundler.

## Standalone IIFE

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@latest/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@latest/dist/browser/global.global.js"></script>
<script>
  window.Notify.toast.success('Saved')
</script>
```

The IIFE installs `window.Notify` and mounts the singleton immediately when `document.body` exists, or once on `DOMContentLoaded`. Pin a published version in production and keep JavaScript and CSS versions aligned.

## Related

- [Browser builds](/notify/reference/browser/)
- [Getting started](/notify/getting-started/)
- [TypeScript reference](/notify/reference/typescript/)
