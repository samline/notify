# Toast notifications for the web

`@samline/notify` turns a function call into a live, accessible toast. No runtime dependencies, no framework runtime, no build step. Import `toast`, mount one renderer, and every call becomes a list item inside a polite live region.

## Three ideas

### A tiny observable

Every toast lives in one module-level observer. The `toast` factory pushes a record into it and notifies subscribers synchronously; the renderer reconciles the DOM when that happens. There is no virtual DOM and no framework to adopt — one shared object per page.

### A vanilla renderer

A mounted toaster creates a single `ol` with the `data-notify-toaster` attribute and one `li` with the `data-notify-toast` attribute per active toast. The renderer drives CSS transitions through attributes and custom properties, measures the stack and handles pointer and keyboard interactions.

### Two module entrypoints

`@samline/notify` is the complete ESM and CommonJS API. `@samline/notify/browser` exposes the same surface as a single registry object. The standalone build at `dist/browser/global.global.js` registers that surface as `window.Notify`.

## What it solves

Use Notify when you want ordinary DOM integration, CSS you control and an observable notification lifecycle.

- **No framework lock-in.** The package is vanilla DOM. `Toaster` is a function alias of `createToaster()`, not a component, so React, Vue, Svelte, Astro and plain HTML all use the same code.
- **Themeable without fighting the library.** The stylesheet targets `data-*` attributes and CSS custom properties. Override `--normal-bg` and the palette follows; override `--width` and the layout follows.
- **A lifecycle you can observe.** `toast.getToasts()` and `toast.getHistory()` return snapshots, `toast.dismiss(id)` ends a toast early, and every state change is published to subscribers.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ position: 'bottom-right', richColors: true })

toast.success('Profile saved', {
  description: 'Your changes are live.',
  action: { label: 'View profile', onClick: () => location.assign('/profile') }
})
```

## Choose your next step

- [Installation](installation.md) — Install the package, load its stylesheet, and send your first toast.
- [Examples](recipes.md) — Complete working files and recipes for common notification flows.
- [Configuration](options.md) — Every toaster and toast option, with defaults and effects.
- [API reference](api/index.md) — The public functions and their lifecycle contracts.

Release notes for every published version live in the [changelog](../CHANGELOG.md).

## When to use each entrypoint

Use the root ESM or CommonJS entry with a bundler. The browser module collects the same singleton helpers without installing a global. Plain HTML and CMS templates can load the standalone script and the separate stylesheet. Direct mounts are advanced: default mounts share state, and separate containers are not independent notification systems.

## Documentation map

- [Getting started](installation.md)
- [Runtime contract](getting-started.md)
- [Accessibility](accessibility.md)
- [Framework integrations](frameworks.md)
- [Examples and recipes](recipes.md)
- [Toast configuration](options.md)
- [Package entrypoints](entrypoints.md)
- [Promise API](promises.md)
- [CSS styling](css-styling.md)
- [TypeScript reference](typescript.md)
- [Browser builds](browser.md)
- [Troubleshooting](troubleshooting.md)
- [API reference](api/index.md)
- [Toast lifecycle](guides/toast-lifecycle.md)
- [Actions and custom content](guides/actions-and-custom-content.md)
- [toast](api/toast.md)
- [createToaster](api/create-toaster.md)
- [configureToaster](api/configure-toaster.md)
- [destroyToaster](api/destroy-toaster.md)
- [getToaster](api/get-toaster.md)
- [resetToasts](api/reset-toasts.md)

## Versioning

The current checkout prepares patch 3.2.1; it has not been published. Published 3.2.0 remains the CDN pin. Patch 3.2.1 repairs the global and lifecycle bugs without removing exports or introducing new required options. See the package changelog for the exact changes.
