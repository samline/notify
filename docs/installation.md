# Getting started

Start with one mounted toaster and one notification. Choose package imports for a bundled app, or the complete HTML / CDN file for a page without a build step.

This guide documents **4.0.0**. The live preview runs the same source.

## Install

<!-- notify:installer -->

The package ships ESM, CommonJS, and browser builds. The root entrypoint is side-effect free: importing it installs no global and touches no DOM.

## Import the stylesheet

The renderer writes attributes and text; the packaged stylesheet turns those into layout, transitions, and palette. Import it once, in the client entrypoint of your application.

```ts
import '@samline/notify/styles.css'
```

Without the stylesheet the runtime still produces a semantic live list, but it has no fixed layout, no stack transitions, and no built-in button presentation.

## Mount one toaster

`createToaster()` mounts the singleton renderer on `document.body`. Call it once, from client-side code, after the document body exists.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ position: 'bottom-right' })

toast.success('Notify is ready')
```

Calling `createToaster()` again does not append a second container. It applies the new options to the existing toaster and returns the same controller.

**Mounting needs a DOM**

`createToaster()` throws when there is no `document`, and throws again when `document.body` is not
ready yet. Move the call into your framework's client lifecycle hook, or wait for
`DOMContentLoaded`. The standalone build already handles this for its own first mount.

## Working starter files

Everything above, in one folder. The complete example loads the published browser build, mounts one toaster, and sends real toasts — no install and no build step.

<!-- notify:starter -->

## The lifecycle

1. **Mount.** `createToaster(options?)` creates the `ol` container, applies the data attributes and the CSS custom properties the stylesheet reads, and subscribes to the shared observer.
2. **Toast.** `toast(message, options?)` and its variants push a record into the observer. The renderer reconciles a list item for that id.
3. **Update.** `toaster.update(options?)` re-applies the container attributes and variables. Omitted options keep their current value.
4. **Resolve.** `toast.promise(input, data?)` ties a loading toast to a success or error toast on the same id.
5. **Dismiss.** Toasts auto-dismiss after their `duration`. `toast.dismiss(id)` ends one early, `toast.dismiss()` ends them all.
6. **Destroy.** `destroyToaster()` unmounts the container, clears every timer, and clears the singleton. Nothing remounts it for you — call `createToaster()` again when you need it back.

## Next steps

- The [toast lifecycle guide](guides/toast-lifecycle.md) explains how state, timers, and the DOM stay in sync.
- [Configuration](options.md) lists every option with its default.
- [Browser builds](browser.md) covers the `window.Notify` global for pages without a bundler.

For the observer, DOM attributes, method side effects and advanced direct mounts, read the [Runtime contract](getting-started.md).
