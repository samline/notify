---
title: Browser builds
description: Use the browser registry, package subpath, or standalone window.Notify IIFE correctly.
template: doc
sidebar:
  order: 6
---

Notify has three related browser-facing forms. They share a `NotifyApi` shape but differ in loading and side effects.

| Form                                                   | Installs `window.Notify` | Auto-mounts | Intended use                               |
| ------------------------------------------------------ | ------------------------ | ----------- | ------------------------------------------ |
| `browser` from `@samline/notify`                       | no                       | no          | Bundled apps that want one registry object |
| default/named `browser` from `@samline/notify/browser` | no                       | no          | Dedicated bundler subpath                  |
| `dist/browser/global.global.js`                        | yes, in a DOM            | yes, once   | Classic `<script>` usage without a bundler |

## Root registry

```ts
import { browser } from '@samline/notify'
import '@samline/notify/styles.css'

browser.createToaster({ position: 'bottom-right' })
browser.toast.success('Saved')
```

The object contains `toast`, `Toaster`, `createToaster`, `configureToaster`, `getToaster`, and `destroyToaster`. It shares the same state and singleton as the corresponding named root exports.

## Browser subpath

```ts
import notify, { browser } from '@samline/notify/browser'
import '@samline/notify/styles.css'

notify.createToaster()
browser.toast.info('Both names refer to the same registry')
```

The subpath exports `browser` as both default and named, and exports `NotifyApi` as a type. It does not include the stylesheet and does not mount automatically.

## Standalone IIFE

The IIFE is a built file rather than the `@samline/notify/browser` module export. Load its stylesheet separately. This complete example puts both scripts after the button and executes the external script synchronously before the inline script.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Notify browser example</title>
    <link rel="stylesheet" href="https://unpkg.com/@samline/notify@latest/dist/styles.css" />
  </head>
  <body>
    <button id="notify" type="button">Show notification</button>

    <script src="https://unpkg.com/@samline/notify@latest/dist/browser/global.global.js"></script>
    <script>
      window.Notify.configureToaster({ richColors: true, position: 'top-right' })

      document.querySelector('#notify').addEventListener('click', () => {
        window.Notify.toast.promise(
          () => new Promise((resolve) => window.setTimeout(() => resolve('ready'), 700)),
          {
            loading: 'Saving changes',
            success: 'Changes saved',
            error: 'Could not save changes'
          }
        )
      })
    </script>
  </body>
</html>
```

Do not combine a deferred external IIFE with an immediately executing classic inline script: the inline script runs during parsing before the deferred file. If scripts must remain in `<head>`, wait for `DOMContentLoaded` in your own script or use a module script whose imports establish ordering.

:::caution[Pin production URLs]
`@latest` is convenient for a demo. Pin a published package version in production, and keep the script and stylesheet on the same version.
:::

## IIFE lifecycle

When evaluated in a browser, the IIFE assigns `window.Notify`. It mounts immediately if `document.body` exists; otherwise it mounts once on `DOMContentLoaded`.

The automatic mount happens only during bundle initialization. After `Notify.destroyToaster()` or `Notify.getToaster().destroy()`, call `Notify.createToaster()` before sending more visible notifications.

```js
window.Notify.destroyToaster()

// Later, remount explicitly.
window.Notify.createToaster({ position: 'bottom-left' })
window.Notify.toast.success('Mounted again')
```

## SSR safety

Importing the root or `@samline/notify/browser` registry does not access the DOM. Calls that mount are DOM-only and must run in client lifecycle code.

The IIFE also checks for a DOM. In a non-DOM runtime it returns its registry export but does not install a global and does not mount. A server import does not arrange a later client mount; the browser must load or hydrate the client entry separately.

## Hosting and base paths

The CDN examples use absolute URLs, so an application base path such as `/notify/` does not affect them. When self-hosting, resolve both files through your own public base:

```html
<link rel="stylesheet" href="/my-app/vendor/notify/styles.css" />
<script src="/my-app/vendor/notify/global.global.js"></script>
```

Verify those URLs directly in production. A missing stylesheet leaves a semantic but visually unstyled list; a missing script leaves `window.Notify` undefined.

## Content Security Policy

Prefer self-hosted assets under strict CSP. Otherwise allow the chosen CDN in both `script-src` and `style-src`. Inline examples also require a nonce/hash or an external application script. Notify's renderer creates inline `style` declarations for layout and custom properties, so a policy that blocks style attributes may require CSP changes or a custom integration; `unstyled` disables built-in toast presentation but does not stop renderer layout declarations.

## TypeScript global declaration

```ts
import type { NotifyApi } from '@samline/notify'

declare global {
  interface Window {
    Notify?: NotifyApi
  }
}
```

Check `window.Notify` when third-party script loading can fail. For all methods, see the [API reference](/notify/reference/api/).
