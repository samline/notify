## @samline/notify
A Sileo-inspired notifications engine with a framework-agnostic core and adapters for Vanilla, React, Vue and Svelte.

Table of Contents

- Installation
- Entry Points
- Quick Start
- Documentation Guides
- Shared API Summary
- Shared Options
- Notes
- License

Installation

Choose the installer that matches your environment.

npm

```bash
npm install @samline/notify
```

pnpm

```bash
pnpm add @samline/notify
```

yarn

```bash
yarn add @samline/notify
```

bun

```bash
bun add @samline/notify
```

CDN / Browser

Use the browser build when your project loads scripts directly and cannot compile npm modules (Shopify, WordPress, plain HTML). Example CDN usage (replace version):

```html
<script src="https://unpkg.com/@samline/notify@latest/dist/notify.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@latest/dist/styles.css">
```

Entry Points

Choose the entrypoint matching your stack so you only import what you need.

| Use case | Import | Guide |
| --- | --- | --- |
| Vanilla JS | `import { default as notifications } from '@samline/notify'` | [docs/vanilla.md](docs/vanilla.md) |
| Vanilla explicit subpath | `import { sileo } from '@samline/notify/vanilla'` | [docs/vanilla.md](docs/vanilla.md) |
| Browser / CDN | `<script src="https://unpkg.com/@samline/notify@latest/dist/notify.umd.js"></script>` | [docs/browser.md](docs/browser.md) |
| React | `import { Toaster } from '@samline/notify/react'` | [docs/react.md](docs/react.md) |
| Vue | `import Notifications from '@samline/notify/vue'` | [docs/vue.md](docs/vue.md) |
| Svelte | `import Toaster from '@samline/notify/svelte'` | [docs/svelte.md](docs/svelte.md) |

Quick Start

Vanilla example (UMD / modules):

```html
<script src="https://unpkg.com/@samline/notify@latest/dist/notify.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@latest/dist/styles.css">
<script>
  const api = window.notify || window.notifications;
  api.initToasters(document.body, ['top-right']);
  api.notify({ title: 'Saved', description: 'Changes saved', type: 'success' });
</script>
```

Documentation Guides

- Vanilla: [docs/vanilla.md](docs/vanilla.md)
- Browser/CDN: [docs/browser.md](docs/browser.md)
- React: [docs/react.md](docs/react.md)
- Vue: [docs/vue.md](docs/vue.md)
- Svelte: [docs/svelte.md](docs/svelte.md)

Shared API Summary

The package exposes a framework-agnostic core controller (`notify`) with the following shape (a `sileo` alias is provided for compatibility). Use `notify` as the primary API in examples and code.

```ts
// core controller
notify.show(options)
notify.success(options)
notify.error(options)
notify.info(options)
notify.warning(options)
notify.action(options)
notify.promise(promise, messages)
notify.dismiss(id)
notify.clear()
```

When using the UMD/browser bundle the global is exposed as `window.notify` (preferred). For compatibility the API object also exposes `window.notifications` which maintains the previous shape.

Shared Options

Common `options` across entrypoints:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Toast title |
| `description` | string | — | Optional body text |
| `type` | `info\|success\|error\|warning` | `info` | Visual intent |
| `position` | string | `top-right` | One of toast positions |
| `duration` | number | `4000` | Auto-dismiss timeout in ms (0 = persistent) |
| `button` | { title: string, onClick: () => void } | — | Optional action button |

Notes

- Accessibility: toasters use `role="status"` and `aria-live="polite"` by default. Respect `prefers-reduced-motion` in your UI.
- The package includes a UMD browser bundle for projects without a build step.
- Motion runtime is optional for module builds; UMD consumers should include the provided `dist/styles.css` for visuals.

License

MIT

