# Notify General API

The Notify API is common for all environments and frameworks. Here you will find all available options and methods.

## Toast Options

| Option      | Type                                                                                            | Description                  |
| ----------- | ----------------------------------------------------------------------------------------------- | ---------------------------- |
| title       | string (optional)                                                                               | Toast title                  |
| description | string                                                                                          | Optional description         |
| type        | 'success'\|'loading'\|'error'\|'warning'\|'info'\|'action'                                      | Toast type                   |
| duration    | number \| null                                                                                  | Duration in ms. `null` = no auto-dismiss |
| position    | 'top-left'\|'top-center'\|'top-right'\|'bottom-left'\|'bottom-center'\|'bottom-right'           | Screen position              |
| styles      | { title, description, badge, button }                                                           | Custom CSS classes           |
| fill        | string                                                                                          | Background color             |
| roundness   | number                                                                                          | Border radius                |
| autopilot   | boolean \| { expand, collapse }                                                                 | Auto expand/collapse control |
| button      | { title: string, onClick: () => void }                                                          | Action button                |

## Main Methods

- `showNotifyToast(options)` — Show a toast (all frameworks)
- `onNotifyToastsChange(fn)` — Subscribe to toast changes (VanillaJS)
- `useNotifyToasts()` — Vue composable
- `notifyToasts` — Svelte store

## React `notify` object

Only available in `@samline/notify/react`. Provides typed shorthand methods and promise handling:

| Method | Description |
| ------ | ----------- |
| `notify.show(options)` | Show a toast |
| `notify.success(options)` | Show a success toast |
| `notify.error(options)` | Show an error toast |
| `notify.warning(options)` | Show a warning toast |
| `notify.info(options)` | Show an info toast |
| `notify.action(options)` | Show an action toast |
| `notify.promise(promise, opts)` | Handle loading/success/error states for a Promise |
| `notify.dismiss(id)` | Dismiss a toast by id |
| `notify.clear(position?)` | Dismiss all toasts, optionally filtered by position |

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
