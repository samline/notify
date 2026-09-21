---
title: Troubleshooting
description: Fix missing styles, DOM timing, SSR, duplicate mounts, CDN paths, CSP, and teardown issues.
template: doc
sidebar:
  order: 11
---

## Toasts do not appear

Confirm a toaster is mounted:

```ts
import { createToaster, getToaster } from '@samline/notify'

if (!getToaster()) createToaster()
```

`toast.*` updates state even when no renderer exists. If a toaster was destroyed, it does not auto-remount; call `createToaster()` again.

## `document.body` error

`createToaster()` throws before `document.body` exists. Use a module loaded after the body, `DOMContentLoaded`, or your framework's client mount hook.

```js
document.addEventListener(
  'DOMContentLoaded',
  () => {
    window.Notify.createToaster()
  },
  { once: true }
)
```

The standalone IIFE already handles this for its initial automatic mount.

## Toasts look like a plain list

Import `@samline/notify/styles.css` in a bundled client entry, or link `dist/styles.css` for the IIFE. Ensure the CSS version matches the JavaScript version and inspect the network response for 404 or HTML fallback content.

## Duplicate notifications

Look for multiple `mountToaster()` calls or framework effects mounted in more than one root. Direct mounts share global `ToastState` and receive the same events. Replace them with one `createToaster()` singleton.

Repeated `createToaster()` calls alone do not create duplicates; they update the same registered controller.

## SSR failures

Imports are safe, but mounting requires the browser. Move `createToaster()` or `mountToaster()` out of module scope and into a client lifecycle. Do not create toast state during server rendering or reuse it across requests.

## CDN global is undefined

- Open the exact IIFE URL and verify it returns JavaScript.
- Put your using script after a synchronous IIFE script at the end of `<body>`.
- If the external script uses `defer`, wait for `DOMContentLoaded`; a following classic inline script is not deferred automatically.
- Check CSP and browser console errors.
- Pin a real published version instead of assuming the repository version is already on the CDN.

## Assets fail under a base path

Use absolute CDN URLs or include the application's public base in self-hosted paths. On a site hosted under `/my-app/`, `/vendor/notify.js` and `/my-app/vendor/notify.js` are different URLs. Verify script and CSS URLs independently.

## Teardown and remount

`destroyToaster()` publishes dismissals, removes the singleton container, and clears the registry. `controller.destroy()` removes that controller and clears the registry when it is the current singleton, but does not publish dismissals itself.

```ts
destroyToaster()

// Required before later notifications can render.
createToaster({ position: 'bottom-right' })
toast.info('Mounted again')
```

`resetToasts()` is different: it clears active/history/counter state while preserving mounted subscribers. `resetToastState()` drops subscribers and leaves mounted containers stale; advanced callers must destroy and remount afterward.

## Strict CSP or custom visuals

The renderer writes inline layout/custom-property declarations. A CSP that blocks style attributes can break positioning even when the stylesheet loads. Adjust the policy for the application or build a controlled advanced renderer integration.

`unstyled: true` disables built-in toast-body presentation, not renderer layout styles. When supplying your own visuals, preserve focus indicators, contrast, responsive width, reduced motion, and button target sizes.

## Callbacks run more than once

With one renderer, dismissal publication is de-duplicated by id. With duplicate direct mounts, each subscribed renderer processes the same event and can call `onDismiss`; remove duplicate mounts. Also ensure application callbacks themselves do not register the same side effect repeatedly during framework development lifecycles.

## Framework migration

If migrating from a framework wrapper, replace the component/plugin with one client lifecycle call to `createToaster()`, import the stylesheet once, and keep `toast.*` calls in ordinary application code. Do not render `<Toaster />`: this package's `Toaster` export is a function alias, not a component.

See [Framework integrations](/notify/reference/frameworks/) for React, Vue, and Svelte examples.
