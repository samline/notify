# Notify

> A small, framework-free toast notification runtime for vanilla JS and direct browser usage.

> It exposes a single `toast` factory plus a singleton toaster controller, renders DOM directly with a vanilla renderer, ships a typed IIFE bundle for `<script>` tags, and keeps every transition and animation in CSS.

---

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [What You Can Build](#what-you-can-build)
- [API at a Glance](#api-at-a-glance)
- [Documentation](#documentation)
- [License](#license)

---

## Installation

```bash
npm install @samline/notify
```

```bash
pnpm add @samline/notify
```

```bash
yarn add @samline/notify
```

```bash
bun add @samline/notify
```

Requires Node 20+ when bundling. Runtime target is ES2020.

---

## CDN / Browser

Use the browser build when you do not have a bundler and need to run the package directly in HTML, Shopify, WordPress, or any traditional template.

```html
<script src="https://unpkg.com/@samline/notify@3.0.0/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `3.0.0` with the version you ship.

The browser bundle exposes a single global: `window.Notify`. It auto-mounts a default toaster, so the first call has somewhere to render.

```html
<button id="save">Save</button>

<script src="https://unpkg.com/@samline/notify@3.0.0/dist/browser/global.global.js"></script>
<script>
  window.Notify.toast('Hello from the browser')
  document.querySelector('#save').addEventListener('click', () => {
    window.Notify.toast.success('Saved')
  })
</script>
```

If you want a custom toaster configuration (position, theme, rich colors), call `window.Notify.createToaster(options)` first — see [docs/browser.md](docs/browser.md) for the full surface.

---

## Entrypoints

| Entrypoint | When to use |
| --- | --- |
| `@samline/notify` | Main vanilla API for bundlers, ESM, or CJS consumers. |
| `@samline/notify/browser` | Pre-bundled IIFE that registers `window.Notify` for direct `<script>` usage. |
| `@samline/notify/styles.css` | The stylesheet the renderer expects. Import it once at app entry. |

The vanilla entrypoint also exports `browser`, the same `{ toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster }` surface as the IIFE but as a module-level singleton (no `globalThis` side-effect). Use it from a bundler when you want the IIFE ergonomics without installing a global — see [docs/browser.md → Using the same shape from a bundler](docs/browser.md#using-the-same-shape-from-a-bundler).

---

## Quick Start

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({
  position: 'bottom-right',
  richColors: true,
  theme: 'system'
})

toast.success('Saved')
toast.error('Could not save', { description: 'Try again in a moment' })
toast.promise(fetchProfile(), {
  loading: 'Loading profile…',
  success: (data) => `Hi ${data.name}`,
  error: 'Could not load profile'
})
```

What this does:

- Mounts a singleton toaster (one per page) with the position, color treatment, and theme you asked for.
- The stylesheet sets up the data-attribute-driven visual contract — no inline styles in JS, no shadow DOM.
- The `toast` factory and its variants (`success`, `error`, `info`, `warning`, `loading`, `message`, `promise`, `custom`, `dismiss`) handle every notification flow.
- `toast.promise` ties a loading → success/error transition to a real `Promise` and re-uses the same toast id so the DOM updates in place.

---

## What You Can Build

- Action confirmations ("Saved", "Copied to clipboard", "Email sent") with auto-dismiss.
- Async feedback with `toast.promise` for fetches, file uploads, and any other `Promise` flow.
- Form errors surfaced as a stacked list via `toast.error` with a `description`.
- Undo / retry flows via the `action` and `cancel` buttons on `ToastOptions`.
- Per-toast rich content via `toast.custom(element | (container) => void)` — no JSX.
- Multi-toaster UIs via the lower-level `mountToaster(root, options)` escape hatch.
- Any shop, CMS template, or static HTML page via the `window.Notify` IIFE.

---

## API at a Glance

The runtime is built around one factory (`toast`) plus a small toaster controller surface. Most controllers are chainable; the `toast` factory is the only function-like call.

| Group | Methods |
| --- | --- |
| Toast factory | [`toast`](docs/api/toast.md) · [`toast.success`](docs/api/toast.md#toastvariants) · [`toast.error`](docs/api/toast.md#toastvariants) · [`toast.info`](docs/api/toast.md#toastvariants) · [`toast.warning`](docs/api/toast.md#toastvariants) · [`toast.loading`](docs/api/toast.md#toastvariants) · [`toast.message`](docs/api/toast.md#toastvariants) · [`toast.custom`](docs/api/toast.md#toastcustom) · [`toast.promise`](docs/api/toast.md#toastpromise) · [`toast.dismiss`](docs/api/toast.md#toastdismiss) · [`toast.getHistory`](docs/api/toast.md#toastgethistory) · [`toast.getToasts`](docs/api/toast.md#toastgettoasts) |
| Toaster lifecycle | [`createToaster`](docs/api/create-toaster.md) · [`destroyToaster`](docs/api/destroy-toaster.md) · [`getToaster`](docs/api/get-toaster.md) · [`configureToaster`](docs/api/configure-toaster.md) · [`resetToasts`](docs/api/reset-toasts.md) |
| Toaster controller | `update(options?)` · `destroy()` · `element` · `options` |
| Registry (vanilla) | [`browser`](docs/getting-started.md#browser-registry-helpers) — bundler-friendly `{ toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster }` singleton. |
| Pure helpers | `mountToaster(root, options?)` — direct escape hatch when you need multiple toasters or a custom mount point. |
| Numeric constants | `VISIBLE_TOASTS_AMOUNT` · `VIEWPORT_OFFSET` · `MOBILE_VIEWPORT_OFFSET` · `TOAST_LIFETIME` · `TOAST_WIDTH` · `GAP` · `SWIPE_THRESHOLD` · `TIME_BEFORE_UNMOUNT` |

See the full per-method reference in [`docs/api/`](docs/api/index.md).

---

## Documentation

Full API reference, guides, and examples are available at **[samline.github.io/notify](https://samline.github.io/notify)**.

| Doc | Purpose |
| --- | --- |
| [docs/getting-started.md](docs/getting-started.md) | Concepts, observable contract, lifecycle, and side-effect overview. |
| [docs/options.md](docs/options.md) | Full `ToasterOptions` and `ToastOptions` reference. |
| [docs/css-styling.md](docs/css-styling.md) | The data-attribute contract the stylesheet expects. |
| [docs/typescript.md](docs/typescript.md) | Every exported TypeScript type, with examples. |
| [docs/api/index.md](docs/api/index.md) | One page per public method. |
| [docs/recipes.md](docs/recipes.md) | End-to-end patterns: `toast.promise` with `fetch`, autoload, theming, etc. |
| [docs/browser.md](docs/browser.md) | Browser global (`window.Notify`) usage. |

---

## License

MIT
