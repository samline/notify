# Browser

Use the browser build when you do not have a bundler and need to integrate the package directly into HTML, Shopify, WordPress, or any traditional template that does not run through a build step.

For every other case (modern apps, bundlers, TypeScript projects), use the main vanilla entrypoint — see [docs/getting-started.md](getting-started.md).

---

## Script tag

```html
<script src="https://unpkg.com/@samline/notify@3.1.2/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `3.1.2` with the version you ship.

The bundle is a single IIFE that registers a global object. Place the `<script>` tag in `<head>` with `defer`, or before the user script in `<body>`. The IIFE also auto-mounts a default toaster (when a DOM is available) so the first `Notify.toast(...)` call has somewhere to render.

You also need the stylesheet. Either copy `dist/styles.css` to your static assets and link it, or load it from the CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@3.1.2/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@3.1.2/dist/browser/global.global.js" defer></script>
```

---

## Global object

The browser build exposes `window.Notify` (also reachable via `globalThis.Notify`).

```ts
window.Notify = {
  toast,
  Toaster: createToaster,
  createToaster,
  configureToaster,
  getToaster,
  destroyToaster
}
```

- `toast` is the same factory exported by `@samline/notify` — see [`docs/api/toast.md`](api/toast.md) for the full surface.
- `createToaster` is the same factory exported by `@samline/notify`. The IIFE auto-mounts a default toaster on load, so calling `createToaster()` later with new options updates the singleton in place via `toaster.update()`.
- `getToaster` and `destroyToaster` are the inspector / lifecycle helpers. See [docs/api/get-toaster.md](api/get-toaster.md) and [docs/api/destroy-toaster.md](api/destroy-toaster.md).

The factory returns a `ToasterController` with the same signatures, semantics, and behaviours as the main vanilla entrypoint — every per-method page in [docs/api/](api/index.md) applies.

---

## Minimal example

```html
<button id="save">Save</button>

<link rel="stylesheet" href="https://unpkg.com/@samline/notify@3.1.2/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@3.1.2/dist/browser/global.global.js" defer></script>
<script>
  document.querySelector('#save').addEventListener('click', () => {
    window.Notify.toast.success('Saved')
  })
</script>
```

The IIFE mounted a default toaster on load. The click handler calls `Notify.toast.success('Saved')`, which renders a `<li data-notify-toast data-type="success">` inside the default toaster's `<ol data-notify-toaster>`. The toast auto-dismisses after 4 seconds.

---

## Custom toaster

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@3.1.2/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@3.1.2/dist/browser/global.global.js" defer></script>
<script>
  // Reconfigure the default toaster (the IIFE already mounted one).
  window.Notify.configureToaster({
    position: 'top-right',
    theme: 'dark',
    richColors: true,
    duration: 6000
  })

  window.Notify.toast.promise(
    fetch('/api/profile').then(r => r.json()),
    {
      loading: 'Loading profile…',
      success: (profile) => `Hi ${profile.name}`,
      error: 'Could not load profile'
    }
  )
</script>
```

`Notify.configureToaster(options)` is an alias of `Notify.createToaster(options)` — kept for intent. Calling it twice with different options updates the singleton in place via `toaster.update(options)`. Calling it with `undefined` returns the existing controller without changes.

---

## Lifecycle helpers

| Helper | Purpose |
| --- | --- |
| `Notify.createToaster(options?)` | Mount (or update) the singleton toaster. Returns the controller. |
| `Notify.configureToaster(options?)` | Alias of `createToaster(options?)`. Kept for intent symmetry with `@samline/forms`. |
| `Notify.getToaster()` | Return the current controller, or `null` if none is mounted. |
| `Notify.destroyToaster()` | Unmount the singleton and drop all in-flight toasts. No-op if none is mounted. |

The toaster returned by `createToaster` is the singleton — every helper works on the same `<ol>`. Use `Notify.toast.*` to push toasts, `Notify.getToaster()` to inspect, and `Notify.destroyToaster()` to tear down.

---

## Surface reference

The browser bundle ships the same surface as the main vanilla entrypoint, plus the IIFE auto-mount. Every method is documented under [docs/api/](api/index.md).

| Global | Purpose |
| --- | --- |
| `Notify.toast` | The factory and every variant. See [`toast`](api/toast.md). |
| `Notify.Toaster(options?)` | Alias of `Notify.createToaster(options?)`. |
| `Notify.createToaster(options?)` | Mount / update the singleton toaster. See [`createToaster`](api/create-toaster.md). |
| `Notify.configureToaster(options?)` | Intent-revealing alias of `createToaster`. See [`configureToaster`](api/configure-toaster.md). |
| `Notify.getToaster()` | Return the singleton controller, or `null`. See [`getToaster`](api/get-toaster.md). |
| `Notify.destroyToaster()` | Unmount the singleton. See [`destroyToaster`](api/destroy-toaster.md). |

### Controller methods

The controller returned by `createToaster` exposes:

- `element` — the `<ol data-notify-toaster>` element.
- `options` — the current merged `ToasterOptions` (live, updates on `update`).
- `update(options?)` — re-applies options and re-renders.
- `destroy()` — unmounts. The IIFE will then auto-remount a fresh default toaster on the next `Notify.toast` call (because `Notify.createToaster` will create a new one).

---

## TypeScript users

The browser build does not ship its own types. Reuse the types exported by `@samline/notify` instead of redeclaring the surface — declare `window.Notify` against the package's `NotifyApi`:

```ts
import type { NotifyApi } from '@samline/notify'

declare global {
  interface Window {
    Notify: NotifyApi
  }
}
```

See [`NotifyApi`](typescript.md#notifyapi) for the full shape.

---

## Using the same shape from a bundler

If you have a bundler but still want the IIFE ergonomics — without the IIFE and without `window.Notify` auto-installed — import the `browser` singleton from the vanilla entrypoint:

```ts
import { browser } from '@samline/notify'
import '@samline/notify/styles.css'

window.MyNotify = { ...browser }

window.MyNotify.createToaster({ position: 'top-right' })
window.MyNotify.toast.success('Saved')
window.MyNotify.destroyToaster()
```

`browser` is a module-level singleton that shares the same `Observer` and toaster as the named exports. Because every spread reads from the same module state, `window.MyNotify.createToaster({})` and `createToaster({})` end up calling the same factory and updating the same DOM container.

If you need multiple independent singletons, use the `mountToaster(root, options?)` escape hatch and keep your own map of controllers:

```ts
import { mountToaster } from '@samline/notify'

const left = mountToaster(document.body, { position: 'bottom-left' })
const right = mountToaster(document.body, { position: 'bottom-right' })

left.destroy()
right.destroy()
```

See the [Browser registry helpers section](getting-started.md#browser-registry-helpers) in the getting-started guide for the full pattern.

---

## Common pitfalls

- **Pin the version.** The CDN URL above is `3.1.2`. Replace it whenever you upgrade.
- **The script must be loaded before any code that uses `window.Notify`.** Place the `<script>` tag in `<head>` with `defer`, or before the user script in `<body>`.
- **The stylesheet is not bundled into the IIFE.** Load `dist/styles.css` separately. The IIFE only sets data-attributes — without the stylesheet the toasts render as an unstyled list.
- **No bundler means no tree-shaking.** The browser bundle includes the full runtime (~6 KB gzipped plus the stylesheet). That is by design — the alternative would defeat the purpose of a no-bundler setup.
- **CSP:** if your site uses a strict Content Security Policy, allow `unpkg.com` in `script-src` and `style-src` (or self-host the files).
- **Server-side rendering (SSR):** the IIFE checks `canUseDOM()` before touching `globalThis.Notify` and before auto-mounting the toaster. It is safe to evaluate in a Node SSR environment — the global is set, but no DOM is mounted.
