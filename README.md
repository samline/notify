<div align="center">
  <h1>Sileo</h1>
  <p><b>Agnostic, physics-based toast notifications for any JS framework or plain browser.</b></p>
  <p>Use Sileo in VanillaJS, Vue, Svelte, or directly in the browser via CDN. One API, all platforms.</p>
</div>

---

## Documentation

- [VanillaJS](docs/vanillajs.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [Browser / CDN](docs/browser.md)
- [General API Reference](docs/api.md)

---

## General API

Sileo exposes a unified API for all environments. All options and methods are available in every integration. No hidden features.

### Toast Options

| Option      | Type                                                                                            | Description                  |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| title       | string                                                                                          | Toast title                  |
| description | string                                                                                          | Optional description         |
| type        | 'success' \| 'loading' \| 'error' \| 'warning' \| 'info' \| 'action'                            | Toast type                   |
| duration    | number                                                                                          | Duration in milliseconds     |
| position    | 'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right' | Screen position              |
| styles      | { title, description, badge, button }                                                           | Custom CSS classes           |
| fill        | string                                                                                          | Background color             |
| roundness   | number                                                                                          | Border radius                |
| autopilot   | boolean \| { expand, collapse }                                                                 | Auto expand/collapse control |
| button      | { title: string, onClick: () => void }                                                          | Action button                |

### Main Methods

- `showSileoToast(options)` — Show a toast (VanillaJS, Vue, Svelte, Browser)
- `onSileoToastsChange(fn)` — Subscribe to toast changes (VanillaJS)
- `useSileoToasts()` — Vue composable
- `sileoToasts` — Svelte store

#### Example

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

---

## Quickstart

Choose your environment and follow the documentation:

- [VanillaJS Quickstart](docs/vanillajs.md)
- [Vue 3 Quickstart](docs/vue.md)
- [Svelte Quickstart](docs/svelte.md)
- [Browser / CDN Quickstart](docs/browser.md)

---

## About

Sileo is a fully documented, framework-agnostic toast notification library. All features and options are available in every integration. For framework-specific helpers or advanced usage, see the documentation for your environment.

If you find any missing option or undocumented feature, please open an issue.
