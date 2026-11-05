---
title: 'Package entrypoints'
titleAccent: 'entrypoints'
description: 'Choose between ESM, CommonJS, the root browser registry, the browser subpath, and the standalone build.'
locale: en
sidebar:
  group: reference
  order: 2
---

Notify exposes separate surfaces for module consumers and script-tag consumers. Choose one primary surface for an integration and import the stylesheet separately.

## Decision table

| Use case                         | Load                                           | Global side effect       | Auto-mount                  |
| -------------------------------- | ---------------------------------------------- | ------------------------ | --------------------------- |
| ESM or TypeScript app            | `import { toast } from '@samline/notify'`      | none                     | no                          |
| CommonJS app                     | `require('@samline/notify')`                   | none                     | no                          |
| Registry object without a global | `import { browser } from '@samline/notify'`    | none                     | no                          |
| Browser subpath                  | `import Notify from '@samline/notify/browser'` | none                     | no                          |
| No bundler                       | `dist/browser/global.global.js`                | installs `window.Notify` | yes, when the body is ready |

Every visual integration also needs `@samline/notify/styles.css`, or the matching `dist/styles.css` asset.

## Root entrypoint

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster()
toast.success('Saved')
```

The root is side-effect free: importing it does not install a global or touch the DOM. It exposes the complete API, the public types, the numeric constants, the `browser` registry object, and the advanced state exports.

```js title="CommonJS"
const { createToaster, toast } = require('@samline/notify')

createToaster()
toast.success('Saved')
```

<span id="registry-object" class="legacy-fragment" aria-hidden="true"></span>

## Registry modules

The root `browser` export and the default and named exports of `@samline/notify/browser` expose the same `NotifyApi` shape. Module imports do not install `window.Notify` and do not auto-mount.

```ts
import Notify, { browser } from '@samline/notify/browser'

Notify.createToaster()
Notify.toast.info('Ready')
console.log(Notify === browser) // true
```

The subpath also exports the `NotifyApi` type:

```ts
import type { NotifyApi } from '@samline/notify/browser'
```

<span id="standalone-iife" class="legacy-fragment" aria-hidden="true"></span>

## Standalone build

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/notify@4.0.0/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@4.0.0/dist/browser/global.global.js"></script>
<script>
  const notify = window.Notify
  notify.toast.success('Saved')
</script>
```

The standalone build installs `window.Notify` and mounts the singleton immediately when `document.body` exists, or once on `DOMContentLoaded`. Pin a published version in production and keep the JavaScript and CSS versions aligned.

<span id="next-steps" class="legacy-fragment" aria-hidden="true"></span>

## Related

- [Browser builds](../browser/)
- [Getting started](../../getting-started/)
- [TypeScript reference](../typescript/)
