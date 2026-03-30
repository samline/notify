
# Notify

A universal toast notification library powered by Sileo, designed to bring the same beautiful, animated experience to React, Vue, Svelte, and Vanilla JS. Built for teams who need Sileo’s quality and API, but require seamless integration across multiple frameworks.

Powered by Sileo — see the original project: https://github.com/hiaaryan/sileo

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
<script src="https://unpkg.com/@samline/notify@0.2.1/dist/notify.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.2.1/dist/styles.css" />

<script>
  // Always use an array of strings as the second argument
  // Correct usage:
  const api = window.notify || window.notifications;
  api.initToasters(document.body, ['top-left']);
  api.notify({
    title: 'Saved',
    description: 'Changes saved',
    type: 'success'
    // You can omit position if you only initialized one position
  });
</script>
```


> ⚠️ **Important:**
> - The second argument to `initToasters` **must be an array of strings** with the positions (e.g. `['top-left']`).
> - **Do not use** `document.body['top-left']` (this is `undefined` and will not work).
> - If you initialize only one position, toasts without an explicit position will go there automatically (dynamic fallback).
> - If you initialize multiple positions, toasts without an explicit position will go to `'top-right'` by default.

Entry Points

Choose the entrypoint matching your stack so you only import what you need.

| Use case      | Import                                                                                                                                        | Guide                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Vanilla JS    | `import { notify, initToasters } from '@samline/notify/vanilla'`                                                                              | [docs/vanilla.md](docs/vanilla.md) |
| Browser / CDN | `<script src="https://unpkg.com/@samline/notify@0.2.1/dist/notify.umd.js"></script>`<br/>`const api = window.notify; api.initToasters(...);` | [docs/browser.md](docs/browser.md) |
| React         | `import { Toaster, notify } from '@samline/notify/react'`                                                                                      | [docs/react.md](docs/react.md)     |
| Vue           | `import { Toaster, notify } from '@samline/notify/vue'`                                                                                        | [docs/vue.md](docs/vue.md)         |
| Svelte        | `import Toaster, { notify } from '@samline/notify/svelte'`                                                                                     | [docs/svelte.md](docs/svelte.md)   |

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



Shared Options (All Entrypoints)

All notification methods accept a rich set of options for full customization. **Position fallback note:**

- If you initialize only one position with `initToasters`, toasts without an explicit `position` will go there (dynamic fallback).
- If you initialize multiple positions, the fallback will be `'top-right'`.
- If you notify to a position that was not initialized, a warning will appear in the console and the toast will not be shown. This warning is now always triggered, incluso si la posición no existe en el DOM.

Example:

```js
// Only one position (dynamic fallback)
api.initToasters(document.body, ['bottom-left']);
api.notify({ title: 'Will go to bottom-left' });

// Multiple positions (classic fallback)
api.initToasters(document.body, ['top-right', 'bottom-left']);
api.notify({ title: 'Will go to top-right' });
api.notify({ title: 'Will go to bottom-left', position: 'bottom-left' });
```

---

All options:

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string \| ReactNode \| SvelteNode      | —           | Optional body text (JSX, HTML, or string)   |
| `type`        | `info\|success\|error\|warning\|action`| `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of toast positions                      |
| `duration`    | number \| null                         | `4000`      | Auto-dismiss timeout in ms (null = sticky)  |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |
| `icon`        | string \| ReactNode \| SvelteNode      | —           | Custom icon (SVG, JSX, or node)             |
| `fill`        | string                                 | —           | Custom background color (SVG or badge)      |
| `styles`      | { title, description, badge, button }  | —           | Custom class overrides for sub-elements     |
| `roundness`   | number                                 | 16          | Border radius in pixels                     |
| `autopilot`   | boolean \| object                      | true        | Auto expand/collapse timing                 |

#### Example: Advanced Toast

```js
notify.success({
  title: "Styled!",
  fill: "#222",
  icon: '<svg>...</svg>',
  styles: {
    title: "text-white!",
    badge: "bg-white/20!",
    button: "bg-white/10!"
  },
  roundness: 24,
  autopilot: false
});
```

#### SileoPromiseOptions

The `promise` method supports advanced flows:

```js
notify.promise(fetchData(), {
  loading: { title: "Loading..." },
  success: (data) => ({ title: `Loaded ${data.name}` }),
  error: (err) => ({ title: "Error", description: err.message }),
  action: (data) => ({ title: "Action required", button: { title: "Retry", onClick: () => retry() } })
});
```

#### Toaster Component Props (React, Svelte, Vue, Vanilla)

All Toaster components accept the following props for global control:

| Prop      | Type                                      | Default      | Description                                 |
| --------- | ----------------------------------------- | ------------ | ------------------------------------------- |
| `position`| string                                    | top-right    | Default toast position                      |
| `offset`  | number \| string \| {top,right,bottom,left}| 0            | Distance from viewport edges                |
| `options` | Partial<Options>                          | —            | Default options for all toasts              |
| `theme`   | "light" \| "dark" \| "system"            | system       | Color scheme (auto, light, dark)            |

See framework-specific guides for more examples.

Notes

- Accessibility: toasters use `role="status"` and `aria-live="polite"` by default. Respect `prefers-reduced-motion` in your UI.
- The package includes a UMD browser bundle for projects without a build step.
- Motion runtime is optional for module builds; UMD consumers should include the provided `dist/styles.css` for visuals.

License

MIT
