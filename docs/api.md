# Notify General API

The Notify API is common for all environments and frameworks. Here you will find all available options and methods.

## Toast Options

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

## Main Methods

- `showNotifyToast(options)` — Show a toast (VanillaJS, Vue, Svelte)
- `onNotifyToastsChange(fn)` — Subscribe to toast changes (VanillaJS)
- `useNotifyToasts()` — Vue composable
- `notifyToasts` — Svelte store

## Full Example

```js
showNotifyToast({
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

Para detalles y ejemplos visuales, consulta la documentación específica de cada framework.
