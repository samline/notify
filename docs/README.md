# Notify docs

This is the markdown reference for `@samline/notify` 3.x — accessible, dependency-free toast notifications for JavaScript and TypeScript, with ESM, CommonJS, and browser builds. The same content is served as a Starlight site at [samline.github.io/notify](https://samline.github.io/notify); the markdown here is the source of truth.

---

## Index

- [Getting started](getting-started.md) — concepts, lifecycle, side-effects, registry helpers.
- [Options](options.md) — every `ToasterOptions` and `ToastOptions` field, with defaults.
- [Entrypoints](entrypoints.md) — ESM, CommonJS, registry modules, the IIFE, and CSS loading.
- [Promise API](promises.md) — loading and settled states, HTTP values, and `unwrap()`.
- [CSS styling](css-styling.md) — the data-attributes the stylesheet expects, and how to theme it.
- [TypeScript reference](typescript.md) — every exported type, callback, and helper shape.
- [Accessibility](accessibility.md) — semantics, keyboard controls, timing, and content guidance.
- [Framework integrations](frameworks.md) — React, Vue, Svelte, SSR, and safe mounting.
- [API reference](api/index.md) — one page per public method.
- [Recipes](recipes.md) — end-to-end patterns for the common flows.
- [Browser](browser.md) — using `window.Notify` with a plain `<script>` tag.
- [Troubleshooting](troubleshooting.md) — fixes for mounting, CSS, SSR, CDN, and teardown.

---

## What this package is

`@samline/notify` exposes a single `toast` factory plus a small toaster-controller surface. The runtime is built around three ideas:

- **A tiny observable.** Every toast lives in a module-level `Observer`; the renderer subscribes to it and re-renders the DOM on each event. No framework runtime, no virtual DOM.
- **A vanilla renderer.** Each active toast becomes a `<li data-notify-toast>` inside a single `<ol data-notify-toaster>`. Every transition is a CSS rule driven by a `data-*` attribute; the JS only sets attributes.
- **Two module entrypoints.** `@samline/notify` exposes the full ESM/CJS API and `@samline/notify/browser` exposes the browser registry. The standalone IIFE under `dist/browser/global.global.js` registers `window.Notify`.

If you have not read the rest of the docs, start with [Getting started](getting-started.md) — it walks through the lifecycle and the observable contract.

---

## When to use each entrypoint

| Situation                                                              | Use                                                                |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Modern app with a bundler (Vite, esbuild, Rollup, Webpack, Bun)        | `@samline/notify`                                                  |
| Plain HTML page, WordPress, Shopify, classic templates                 | `dist/browser/global.global.js`                                    |
| Type-checking the toaster controller from a CDN script                 | declare `window.Notify` against `NotifyApi` from `@samline/notify` |
| You want the IIFE surface from a bundler (no `globalThis` side-effect) | `import { browser } from '@samline/notify'`                        |
| You need multiple toasters in the same page                            | `import { mountToaster } from '@samline/notify'`                   |

---

## File-by-file map

| File                                                 | What is in it                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| [getting-started.md](getting-started.md)             | Concepts, observable contract, lifecycle, registry helpers, side-effect table.  |
| [options.md](options.md)                             | Every `ToasterOptions` and `ToastOptions` field, with defaults and rationale.   |
| [entrypoints.md](entrypoints.md)                     | Module formats, registries, IIFE behavior, and stylesheet loading.              |
| [promises.md](promises.md)                           | Complete `toast.promise()` behavior and original-outcome semantics.             |
| [css-styling.md](css-styling.md)                     | The data-attribute contract the stylesheet expects; theming with CSS variables. |
| [typescript.md](typescript.md)                       | Every exported type, callback signature, and helper return shape.               |
| [accessibility.md](accessibility.md)                 | Rendered semantics, keyboard behavior, timing, and custom-content guidance.     |
| [frameworks.md](frameworks.md)                       | Lifecycle-safe React, Vue, Svelte, and SSR integration patterns.                |
| [api/index.md](api/index.md)                         | Overview of the public API.                                                     |
| [api/toast.md](api/toast.md)                         | The `toast` factory and every variant.                                          |
| [api/create-toaster.md](api/create-toaster.md)       | The toaster mount / idempotent update entry.                                    |
| [api/destroy-toaster.md](api/destroy-toaster.md)     | The toaster unmount entry.                                                      |
| [api/get-toaster.md](api/get-toaster.md)             | The toaster inspector entry.                                                    |
| [api/configure-toaster.md](api/configure-toaster.md) | The `createToaster` alias, kept for intent.                                     |
| [api/reset-toasts.md](api/reset-toasts.md)           | Drop every toast and rewind the internal counter.                               |
| [recipes.md](recipes.md)                             | `toast.promise` with `fetch`, autoload, multi-toaster, theming, custom content. |
| [browser.md](browser.md)                             | Using `window.Notify` from a plain `<script>` tag.                              |
| [troubleshooting.md](troubleshooting.md)             | Mounting, styles, duplicate renderers, CDN, CSP, reset, and remount fixes.      |

---

## Versioning

This documentation matches the current `@samline/notify` 3.x API. The previous multi-framework versions (1.x and 2.0.0–2.0.3) used a different API surface and are not covered here.
