# Notify

A toast notification library powered by Sileo, designed to bring the same beautiful, animated experience to React, Vue, Svelte, and Vanilla JS. Built for teams who need Sileo’s quality and API, but require seamless integration across multiple frameworks.

---

## Sileo project: [text](https://github.com/hiaaryan/sileo)

---

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [What can you do?](#what-can-you-do)
- [General API](#general-api)
- [Minimal Example](#minimal-example)
- [Framework Documentation](#framework-documentation)
- [License](#license)

---

## Installation

```bash
npm install @samline/notify
# React
npm install @samline/notify/react
# Vue
npm install @samline/notify/vue
# Svelte
npm install @samline/notify/svelte
```

---

## CDN / Browser

Include the generated UMD file (`dist/browser-sileo.js`) in your HTML:

```html
<script src="dist/browser-sileo.js"></script>
<script>
  Sileo.show({
    title: 'Hello from the browser',
    type: 'success',
    duration: 2000,
  })
</script>
```

---

## Entrypoints

| Entrypoint                         | Description                   |
| ---------------------------------- | ----------------------------- |
| @samline/notify                    | VanillaJS API                 |
| @samline/notify/react              | React API (hooks and helpers) |
| @samline/notify/vue                | Vue API (composable)          |
| @samline/notify/svelte             | Svelte API (store)            |
| @samline/notify/dist/browser-sileo | Global for Browser/CDN        |

---

## Quick Start

### Import by framework

**VanillaJS (default):**

```js
import { showSileoToast } from '@samline/notify'
showSileoToast({ title: 'Hello world!', type: 'success' })
```

**React:**

```js
import { showSileoToast } from '@samline/notify/react'
showSileoToast({ title: 'Hello from React!', type: 'success' })
```

**Vue:**

```js
import { showSileoToast, useSileoToasts } from '@samline/notify/vue'
showSileoToast({ title: 'Hello from Vue!', type: 'success' })
```

**Svelte:**

```js
import { showSileoToast, sileoToasts } from '@samline/notify/svelte'
showSileoToast({ title: 'Hello from Svelte!', type: 'success' })
```

Each framework imports from its own context, ensuring optimal integration and correct types. See the specific documentation for advanced examples.

For complete examples and plug-and-play UI, see your framework's documentation:

- [React](docs/react.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [VanillaJS](docs/vanillajs.md)
- [Browser / CDN](docs/browser.md)

---

## What can you do?

- Show toasts with physics-based, customizable animations
- Use the same API in React, Vue, Svelte, VanillaJS, and Browser
- Customize position, duration, styles, icons, and buttons
- Integrate plug-and-play UI or create your own rendering
- Subscribe to toast changes (store/composable/callback)
- Use from bundlers or directly in HTML

---

## General API

Sileo exposes a unified API for all environments. All options and methods are available in each integration.

### Toast Options

| Option      | Type                                                                                  | Description                  |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| title       | string                                                                                | Toast title                  |
| description | string                                                                                | Optional description         |
| type        | 'success'\|'loading'\|'error'\|'warning'\|'info'\|'action'                            | Toast type                   |
| duration    | number                                                                                | Duration in milliseconds     |
| position    | 'top-left'\|'top-center'\|'top-right'\|'bottom-left'\|'bottom-center'\|'bottom-right' | Screen position              |
| styles      | { title, description, badge, button }                                                 | Custom CSS classes           |
| fill        | string                                                                                | Background color             |
| roundness   | number                                                                                | Border radius                |
| autopilot   | boolean\|{ expand, collapse }                                                         | Auto expand/collapse control |
| button      | { title: string, onClick: () => void }                                                | Action button                |

### Main Methods

- `showSileoToast(options)` — Show a toast (in all environments)
- `onSileoToastsChange(fn)` — Subscribe to changes (VanillaJS)
- `useSileoToasts()` — Vue composable
- `sileoToasts` — Svelte store

---

## Minimal Example

```js
showSileoToast({
  title: 'Action required',
  description: 'Click the button to continue',
  type: 'action',
  button: {
    title: 'Continue',
    onClick: () => alert('You continued!'),
  },
  styles: {
    title: 'my-title',
    button: 'my-button',
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000,
})
```

## Framework Documentation

- [React](docs/react.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [VanillaJS](docs/vanillajs.md)
- [Browser / CDN](docs/browser.md)
- [General API](docs/api.md)

---

## License

MIT
