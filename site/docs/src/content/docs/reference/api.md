---
title: 'API reference'
titleAccent: 'reference'
description: 'The complete public surface of @samline/notify, with the contract of every exported function.'
locale: en
sidebar:
  group: reference
  order: 7
---

## Toast factory

### `toast(message, options?)`

```ts
function toast(message: Renderable, options?: ToastOptions): ToastId
```

Creates a normal toast and returns its number or string id. Text is assigned with `textContent`. Reusing an id updates the existing state item and the rendered element.

```ts
const id = toast.loading('Uploading file')
window.setTimeout(() => toast.success('Upload complete', { id }), 800)
```

### Variants

All text variants accept `(message: Renderable, options?: ToastOptions)` and return a `ToastId`.

| Method            | Forced type    | Automatic dismissal                          |
| ----------------- | -------------- | -------------------------------------------- |
| `toast.success()` | `'success'`    | yes                                          |
| `toast.error()`   | `'error'`      | yes                                          |
| `toast.info()`    | `'info'`       | yes                                          |
| `toast.warning()` | `'warning'`    | yes                                          |
| `toast.loading()` | `'loading'`    | no                                           |
| `toast.message()` | no forced type | yes; equivalent to the callable base factory |

The forced type of a variant overrides a `type` supplied in its options. Resolve a manual loading toast by updating the same id or dismissing it.

### `toast.custom(content, options?)`

```ts
function toast.custom(content: CustomContent, options?: ToastOptions): ToastId
```

Accepts an `HTMLElement` or a `(container: HTMLElement) => void` callback. The renderer mounts the custom DOM in a `[data-custom]` element and marks the toast unstyled. It does not sanitize your DOM, and custom toasts do not render the generated close button.

```ts
const content = document.createElement('p')
content.textContent = 'A safe custom notification'
toast.custom(content, { duration: 6000 })
```

### `toast.promise(input, data?)`

```ts
function toast.promise<Data>(
  input: PromiseInput<Data>,
  data?: PromiseData<Data>
): { id: ToastId; unwrap: () => Promise<Data> } | { id?: undefined; unwrap: () => Promise<Data> }
```

The id is present only when an initial loading toast was created. The loading state, settled value forms, descriptions, HTTP behavior, `finally`, and `unwrap()` are documented in the [Promise API](../../reference/promises/).

### `toast.dismiss(id?)`

```ts
function toast.dismiss(id?: ToastId): ToastId | undefined
```

With an id, it publishes one dismissal and returns that id. Without an id, it publishes a dismissal for every not-yet-dismissed state item and returns `undefined`. Dismissing the same id twice is ignored. The renderer marks matching elements as removed and deletes them after their exit transition.

Programmatic dismissal is allowed even when `dismissible` is false. Dismissed records remain in the history until a reset.

### `toast.getToasts()`

```ts
function toast.getToasts(): ToastT[]
```

Returns the active records, newest first. Every call returns a new array and a new shallow object for each toast; the nested `action` and `cancel` objects are cloned too. Functions, promises, and DOM nodes naturally remain the same references.

### `toast.getHistory()`

```ts
function toast.getHistory(): ToastT[]
```

Returns all current history records, including dismissed records, with the same defensive snapshot behavior as `getToasts()`. Updating an existing id replaces its state record rather than appending a second history item.

## Toaster lifecycle

### `createToaster(options?)`

```ts
function createToaster(options?: ToasterOptions): ToasterController
```

Mounts the singleton on `document.body`, or calls `update(options)` on the current singleton. It throws without a DOM, and throws when `document.body` does not exist yet.

### `Toaster(options?)`

`Toaster` is an exact root-export alias of `createToaster`. It is not a framework component and not a constructor.

```ts
import { Toaster } from '@samline/notify'

const controller = Toaster({ position: 'top-right' })
```

### `configureToaster(options?)`

An intent-oriented function that delegates to `createToaster(options)`. It creates the singleton if needed and otherwise updates it.

### `getToaster()`

```ts
function getToaster(): ToasterController | null
```

Returns the current singleton controller, or `null`. A controller created by a direct `mountToaster()` call is not registered here.

### `destroyToaster()`

```ts
function destroyToaster(): void
```

If the singleton exists, it first publishes dismissals while the renderer is still subscribed. That lets dismissal callbacks and the exit state run before it removes the listeners, the timers, and the container. It then clears the singleton registry. The state history remains.

Nothing auto-remounts after destruction. Call `createToaster(options)` explicitly before showing more visible toasts. The standalone build auto-mounts only once, when its script initializes.

Calling `controller.destroy()` on the singleton also clears the singleton registry when that controller is still current. This lower-level path unmounts immediately and does not itself publish dismissals, so use `destroyToaster()` when the dismissal lifecycle matters.

### `resetToasts()`

```ts
function resetToasts(): void
```

Publishes a dismissal for every active record, then clears the active records, the history, the dismissed ids, and the generated-id counter back to `1`. Mounted subscriptions are preserved, so the current toaster remains usable and future events still render. It is primarily useful for tests and development tools.

## Controller

```ts
interface ToasterController {
  element: HTMLElement
  options: ToasterOptions
  update(options?: ToasterOptions): ToasterController
  destroy(): void
}
```

- `element` is the mounted container with the `data-notify-toaster` attribute.
- `options` returns the current shallow-merged options.
- `update()` preserves omitted settings, updates the renderer attributes and styles, and returns the same controller.
- `destroy()` removes timers, listeners, subscriptions, and the container. It is safe to call repeatedly.

## Browser registry

### Root `browser`

```ts
import { browser } from '@samline/notify'
```

`browser` is a `NotifyApi` object containing `toast`, `Toaster`, `createToaster`, `configureToaster`, `getToaster`, and `destroyToaster`. It shares the named exports' singleton and state. It neither installs a global nor auto-mounts.

### `@samline/notify/browser`

```ts
import browser, { browser as notifyBrowser } from '@samline/notify/browser'
```

The subpath exports the same registry as both its default and its named export, plus the `NotifyApi` type. It is import-safe during server rendering and does not auto-mount. See [Browser builds](../../reference/browser/).

## Advanced exports

These exports expose shared internals. Most applications should use the singleton lifecycle above.

### `mountToaster(root, options?, state?)`

Mounts a controller beneath `root`. The optional third argument accepts the same shape as the exported `ToastState` and is intended for controlled advanced use and tests.

Without an injected state, every direct mount subscribes to the global `ToastState` and receives the same published events. Multiple unfiltered mounts render duplicate toasts. The `id` and `toasterId` fields only filter this shared stream; they do not provide isolated state, history, counters, or subscriptions.

### `ToastState`

The shared observer instance. Its public runtime surface includes `subscribers`, `toasts`, `dismissedToasts`, `subscribe`, `publish`, `create`, the variant methods, `promise`, `custom`, `dismiss`, `getActiveToasts`, `getHistory`, and `getToasts`. Subscribers run synchronously, and a thrown subscriber error interrupts publication.

```ts
import { ToastState, type ToastSubscriber } from '@samline/notify'

const subscriber: ToastSubscriber = event => {
  console.log(event)
}

const unsubscribe = ToastState.subscribe(subscriber)
```

### `resetToastState()`

A low-level destructive reset. It clears the records, the dismissed ids, and the counter, **and drops every subscriber**, including the mounted renderer subscriptions. Existing containers will no longer receive events. Prefer `resetToasts()`. If advanced code calls `resetToastState()`, destroy the stale controllers and mount again explicitly.

## Per-method pages

- [`toast`](../../api/toast/)
- [`createToaster`](../../api/create-toaster/)
- [`destroyToaster`](../../api/destroy-toaster/)
- [`getToaster`](../../api/get-toaster/)
- [`configureToaster`](../../api/configure-toaster/)
- [`resetToasts`](../../api/reset-toasts/)
