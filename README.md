# Notify

Accessible, dependency-free toast notifications for JavaScript and TypeScript, with ESM, CommonJS, and browser builds.

[Demo](https://samline.github.io/notify/) · [Examples](https://samline.github.io/notify/examples/) · [Documentation](https://samline.github.io/notify/docs/) · [Changelog](CHANGELOG.md)

Current version: **4.0.0**. See the [changelog](CHANGELOG.md) for behavior changes from 3.x.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [HTML / CDN](#html--cdn)
- [Capabilities](#capabilities)
- [API at a glance](#api-at-a-glance)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

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

## Quick start

Run once at your application’s client root, after `document.body` exists.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

const toaster = createToaster({
  position: 'bottom-right',
  richColors: true,
  theme: 'system'
})

toast.success('Saved')
```

What this does:

- Mounts a singleton toaster (one per page) with the position, color treatment, and theme you asked for.
- The stylesheet defines layout, stack and appearance through data attributes. The renderer supplies measured geometry through CSS custom properties; it does not use shadow DOM.
- The `toast` factory emits notifications; its variants support semantic feedback, promises and custom DOM.

Keep `toaster` to update preferences. At application teardown, call `destroyToaster()` to dispose the singleton and dismiss its active notifications. See the [lifecycle guide](docs/guides/toast-lifecycle.md) for remounting and lower-level controller ownership.

<a id="cdn--browser"></a>

## HTML / CDN

Use the browser build when you do not have a bundler and need to run the package directly in HTML, Shopify, WordPress, or any traditional template.

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@4.0.0/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@4.0.0/dist/browser/global.global.js"></script>
```

> Pin a concrete published version in production instead of `latest`.

The browser bundle exposes a single global: `window.Notify`. It auto-mounts a default toaster, so the first call has somewhere to render.

```html
<button id="save">Save</button>

<link rel="stylesheet" href="https://unpkg.com/@samline/notify@4.0.0/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@4.0.0/dist/browser/global.global.js"></script>
<script>
  const notify = window.Notify
  notify.toast('Hello from the browser')
  document.querySelector('#save').addEventListener('click', () => {
    notify.toast.success('Saved')
  })
</script>
```

If you want a custom toaster configuration (position, theme, rich colors), resolve the registry once, then call `notify.createToaster(options)` first — see [docs/browser.md](docs/browser.md) for the full surface.

<a id="what-you-can-build"></a>

## Capabilities

- Action confirmations ("Saved", "Copied to clipboard", "Email sent") with auto-dismiss.
- Async feedback with `toast.promise` for fetches, file uploads, and any other `Promise` flow.
- Form errors surfaced as a stacked list via `toast.error` with a `description`.
- Undo / retry flows via the `action` and `cancel` buttons on `ToastOptions`.
- Per-toast rich content via `toast.custom(element)` or `toast.custom(() => element)` — no JSX.
- Multiple render roots through `mountToaster(root, options)`. Direct mounts share the default observer unless you supply another `ToastState`; they do not create isolated channels automatically.
- Any shop, CMS template, or static HTML page via the `window.Notify` IIFE.

## API at a glance

The toast factory publishes records. The singleton lifecycle mounts, updates and disposes their renderer. A controller exposes `update()` (chainable), `destroy()`, `element` and `options`; advanced exports provide direct rendering and observable state.

| Group              | Methods                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toast factory      | [`toast`](docs/api/toast.md) · [`toast.success`](docs/api/toast.md#toastvariants) · [`toast.error`](docs/api/toast.md#toastvariants) · [`toast.info`](docs/api/toast.md#toastvariants) · [`toast.warning`](docs/api/toast.md#toastvariants) · [`toast.loading`](docs/api/toast.md#toastvariants) · [`toast.message`](docs/api/toast.md#toastvariants) · [`toast.custom`](docs/api/toast.md#toastcustom) · [`toast.promise`](docs/api/toast.md#toastpromise) · [`toast.dismiss`](docs/api/toast.md#toastdismiss) · [`toast.getHistory`](docs/api/toast.md#toastgethistory) · [`toast.getToasts`](docs/api/toast.md#toastgettoasts) |
| Toaster lifecycle  | [`createToaster`](docs/api/create-toaster.md) · [`destroyToaster`](docs/api/destroy-toaster.md) · [`getToaster`](docs/api/get-toaster.md) · [`configureToaster`](docs/api/configure-toaster.md) · [`resetToasts`](docs/api/reset-toasts.md)                                                                                                                                                                                                                                                                                                                                                                                       |
| Toaster controller | `update(options?)` · `destroy()` · `element` · `options`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Registry (vanilla) | [`browser`](docs/getting-started.md#browser-registry-helpers) — bundler-friendly `{ toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster }` singleton.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Pure helpers       | `mountToaster(root, options?)` — direct escape hatch when you need multiple toasters or a custom mount point.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Numeric constants  | `VISIBLE_TOASTS_AMOUNT` · `VIEWPORT_OFFSET` · `MOBILE_VIEWPORT_OFFSET` · `TOAST_LIFETIME` · `TOAST_WIDTH` · `GAP` · `SWIPE_THRESHOLD` · `TIME_BEFORE_UNMOUNT`                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

See the full per-method reference in [`docs/api/`](docs/api/index.md).

### Entrypoints

| Entrypoint                   | When to use                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `@samline/notify`            | Main vanilla API for bundlers, ESM, or CJS consumers.                        |
| `@samline/notify/browser`    | Importable ESM/CJS browser registry; the CDN file registers `window.Notify`. |
| `@samline/notify/styles.css` | The stylesheet the renderer expects. Import it once at app entry.            |

The root entrypoint also exports `browser` and its `Notify` alias, the same `{ toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster }` surface as the IIFE but as a module-level singleton (no `globalThis` side-effect). Use it from a bundler when you want the IIFE ergonomics without installing a global — see [docs/browser.md → Using the same shape from a bundler](docs/browser.md#using-the-same-shape-from-a-bundler).

### Async feedback

Continue from the setup above with your application’s promise. This example expects `/api/profile` to return JSON containing a name; replace that endpoint with your own.

```ts
async function fetchProfile(): Promise<{ name: string }> {
  const response = await fetch('/api/profile')
  if (!response.ok) throw new Error('Could not load profile')
  return response.json()
}

toast.promise(fetchProfile(), {
  loading: 'Loading profile…',
  success: (profile) => `Hi ${profile.name}`,
  error: 'Could not load profile'
})
```

`toast.promise()` updates one id when a loading message is supplied. Its `unwrap()` preserves the original outcome; consumer cancellation belongs to the application. See the [complete promise contract](docs/promises.md) and [working task examples](docs/recipes.md).

## Documentation

Version 4.0.0 includes the stability fixes, the direct `window.Notify` global and the behavior changes listed in [CHANGELOG.md](CHANGELOG.md).

The landing page lives at **[samline.github.io/notify](https://samline.github.io/notify)** and the full documentation at **[samline.github.io/notify/docs](https://samline.github.io/notify/docs)**.

The markdown files below are the source of truth for the package. The published site in [`site/`](site/) mirrors them.

| Doc                                                | Purpose                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [docs/installation.md](docs/installation.md)       | Short setup, styles, first notification and complete working files.                |
| [docs/getting-started.md](docs/getting-started.md) | Concepts, observable contract, lifecycle, and side-effect overview.                |
| [docs/options.md](docs/options.md)                 | Full `ToasterOptions` and `ToastOptions` reference.                                |
| [docs/entrypoints.md](docs/entrypoints.md)         | ESM, CommonJS, registries, the standalone IIFE, and stylesheet loading.            |
| [docs/promises.md](docs/promises.md)               | Complete `toast.promise()` behavior, HTTP values, and `unwrap()`.                  |
| [docs/css-styling.md](docs/css-styling.md)         | The data-attribute contract the stylesheet expects.                                |
| [docs/typescript.md](docs/typescript.md)           | Every exported TypeScript type, with examples.                                     |
| [docs/accessibility.md](docs/accessibility.md)     | Semantics, keyboard controls, timing, and accessible content guidance.             |
| [docs/frameworks.md](docs/frameworks.md)           | Lifecycle-safe React, Vue, Svelte, and SSR integration patterns.                   |
| [docs/api/index.md](docs/api/index.md)             | Factory variants, singleton lifecycle, state and low-level rendering.              |
| [docs/recipes.md](docs/recipes.md)                 | Task-oriented patterns: promises, cancellation, actions, custom DOM and observers. |
| [docs/browser.md](docs/browser.md)                 | Browser global (`window.Notify`) usage.                                            |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Fixes for mounting, CSS, duplicate renderers, CDN, CSP, and teardown.              |

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## AI agent skill

The [Notify integration skill](skills/notify/SKILL.md) teaches the actual package API and lifecycle. Download it from the website's skill link or read the versioned source here. Installation location depends on your agent; no global installation is required.

## License

MIT
