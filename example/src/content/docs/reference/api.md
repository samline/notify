---
title: API reference
description: Method-by-method reference for @samline/notify.
template: doc
sidebar:
  order: 3
---

Every public method is listed here, grouped by lifecycle. The `toast` factory is the only function-like call; the rest of the methods hang off either `toast` (variants + lifecycle helpers) or a `ToasterController` returned by `createToaster`.

:::tip[Reading the signatures]
Methods on `toast` that return data — `dismiss`, `getHistory`, `getToasts` — end in a different return type. The rest return a `ToastId`. The methods on the `ToasterController` are chainable: `update()` returns the same controller.
:::

## Toast factory

- [`toast(message, options?)`](#toastmessage-options) — the canonical entry point. Returns a `ToastId`.
- [`toast.success` / `error` / `info` / `warning` / `loading` / `message`](#toastvariants) — sugar for `toast(message, { ...options, type: '<variant>' })`.
- [`toast.custom(content, options?)`](#toastcustom) — mount rich content (`HTMLElement` or callback).
- [`toast.promise(promise, data?)`](#toastpromise) — loading → success/error transition in one id.
- [`toast.dismiss(id?)`](#toastdismiss) — drop one toast or every active toast.
- [`toast.getHistory()`](#toastgethistory) — readonly snapshot of every toast since page load.
- [`toast.getToasts()`](#toastgettoasts) — readonly snapshot of the active toasts.

## Toaster lifecycle

- [`createToaster(options?)`](#createtoasteroptions) — mount the singleton toaster; idempotent.
- [`configureToaster(options?)`](#configuretoasteroptions) — intent-revealing alias of `createToaster`.
- [`destroyToaster()`](#destroytoaster) — unmount the singleton; no-op if none.
- [`getToaster()`](#gettoaster) — read the singleton controller; `null` if none.
- [`resetToasts()`](#resettoasts) — drop every toast and rewind the internal counter.

## Controller surface

The object returned by `createToaster` (and `mountToaster`):

- `element` — the `<ol data-notify-toaster>` element.
- `options` — the current merged `ToasterOptions` (live).
- `update(options?)` — re-applies options and re-renders.
- `destroy()` — unmounts; idempotent.

## Registry helpers (vanilla)

- [`browser`](#browser) — module-level singleton that wraps `toast` + `Toaster` + `createToaster` + `configureToaster` + `getToaster` + `destroyToaster`. Mirrors the IIFE surface without auto-installing a global.

---

## Per-method summaries

### Toast factory

#### `toast(message, options?)`

The main entry point. Pushes a new toast into the `Observer` and returns the id.

```ts
function toast(message: Renderable, options?: ToastOptions): ToastId
```

- `message` — the title text. Strings and numbers render as `textContent`; `null` / `undefined` / `false` render as nothing.
- `options` — per-toast options — `id`, `description`, `type`, `duration`, `action`, `cancel`, etc. See the [Configuration reference](/notify/reference/configuration/#toastoptions-reference).

Re-using an `id` updates the existing toast in place. The runtime fingerprints the content (type, title, description, action, cancel) and re-fills only when one of those fields changed.

```ts
const id = toast('Uploading…')

await uploadFile(file)

toast.success('Upload complete', { id })
```

#### `toast.variants`

The variant helpers are sugar for `toast(message, { ...options, type: 'X' })`. Every one returns a `ToastId` and accepts the same `ToastOptions` shape (minus `type`, which the variant forces).

```ts
toast.success(message, options?)
toast.error(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.loading(message, options?)
toast.message(message, options?)  // alias of the callable form
```

The only difference between the variants is the `type` they set:

| Variant         | Forced `type` | Auto-dismiss                                                                    |
| --------------- | ------------- | ------------------------------------------------------------------------------- |
| `toast.success` | `'success'`   | yes                                                                             |
| `toast.error`   | `'error'`     | yes                                                                             |
| `toast.info`    | `'info'`      | yes                                                                             |
| `toast.warning` | `'warning'`   | yes                                                                             |
| `toast.loading` | `'loading'`   | **no** — resolved manually with `toast.success({ id })` / `toast.error({ id })` |
| `toast.message` | `'normal'`    | yes                                                                             |
| `toast(...)`    | `'normal'`    | yes                                                                             |

You can still pass `duration: Infinity` on a non-loading variant to suppress the auto-dismiss:

```ts
toast.info('Long heads up', { duration: Infinity })
```

#### `toast.custom`

Mount rich content inside a toast. Accepts either an `HTMLElement` you own or a callback that fills a container.

```ts
function toast.custom(content: CustomContent, options?: ToastOptions): ToastId
```

`CustomContent` is `HTMLElement | ((container: HTMLElement) => void)`.

```ts
toast.custom((container) => {
  const img = document.createElement('img')
  img.src = '/avatars/sam.png'
  img.alt = ''
  img.width = 32
  img.height = 32
  img.style.borderRadius = '50%'

  const text = document.createElement('div')
  text.innerHTML = `
    <div data-title>Sam liked your post</div>
    <div data-description>5 minutes ago</div>
  `

  container.appendChild(img)
  container.appendChild(text)
})
```

The renderer creates a `<div data-custom>` for you and passes it as the only argument. Your callback fills it with whatever DOM you own. The runtime does not sanitize custom content — never inject user-supplied HTML.

#### `toast.promise`

Tie a loading → success/error transition to a real `Promise`. Reuses one id, so the DOM updates in place.

```ts
function toast.promise<Data>(
  promise: PromiseInput<Data>,
  data?: PromiseData<Data>
): { id?: ToastId; unwrap: () => Promise<Data> }
```

```ts
toast.promise(fetchProfile(), {
  loading: 'Loading profile…',
  success: (data) => `Hi ${data.name}`,
  error: 'Could not load profile'
})
```

The `loading` toast appears immediately (or not at all if you omit it). Once the promise settles, the same id is updated in place:

- If the response is `Response.ok === false` or the value is an `Error`, `error` is invoked.
- Otherwise `success` is invoked with the resolved value.
- `finally` runs after the settled toast renders, regardless of outcome.

`success` and `error` accept a `Renderable`, a `PromiseExtendedResult`, or a callback returning either:

```ts
toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: (profile) => ({
    message: `Saved as ${profile.name}`,
    type: 'success',
    action: { label: 'View', onClick: () => location.assign('/profile') }
  }),
  error: (err) => ({
    message: 'Save failed',
    type: 'error',
    description: err instanceof Error ? err.message : 'Try again in a moment'
  })
})
```

#### `toast.dismiss`

Drop one toast or every active toast.

```ts
function toast.dismiss(id?: ToastId): ToastId | undefined
```

```ts
// Drop every active toast.
toast.dismiss()

// Drop a specific toast.
const id = toast('Saved')
toast.dismiss(id)
```

The `<li>` is marked `data-removed="true"` so the exit transition runs. The actual DOM removal is scheduled after `TIME_BEFORE_UNMOUNT` (200ms by default). The id remains in the history returned by `toast.getHistory()`.

#### `toast.getHistory`

Read-only snapshot of every toast since page load, including dismissed ones.

```ts
function toast.getHistory(): ToastT[]

console.log(`There have been ${toast.getHistory().length} toasts since page load.`)
```

#### `toast.getToasts`

Read-only snapshot of every active toast (not yet dismissed).

```ts
function toast.getToasts(): ToastT[]

const active = toast.getToasts()
if (active.length >= 3) {
  toast.dismiss(active[0].id)  // Drop the oldest to make room.
}
```

### Toaster lifecycle

#### `createToaster(options?)`

Mount (or update) the singleton toaster and return its controller. Idempotent: calling it twice with different options applies the diff via `controller.update()`.

```ts
function createToaster(options?: ToasterOptions): ToasterController
```

Throws `Error('createToaster() requires a DOM environment (browser)')` when called in a non-DOM context.

```ts
createToaster({ position: 'bottom-right' })

// Update later.
const toaster = getToaster()
toaster?.update({ theme: 'dark' })
```

#### `configureToaster(options?)`

Intent-revealing alias of `createToaster(options?)`. Same signature, same return type, same behaviour. Use the name that reads better at the call site:

```ts
// At app entry — "create the toaster."
createToaster({ position: 'bottom-right' })

// Later, in a settings panel — "configure the existing toaster."
configureToaster({ duration: 8000 })
```

#### `destroyToaster()`

Unmount the singleton toaster and drop all in-flight toasts. No-op if no toaster is mounted.

```ts
function destroyToaster(): void
```

```ts
router.on('/profile', () => createToaster({ position: 'bottom-right' }))
router.off('/profile', () => destroyToaster())
```

`destroyToaster` is idempotent — safe to call inside a `beforeEach` block.

#### `getToaster()`

Return the singleton toaster controller, or `null` if none is mounted.

```ts
function getToaster(): ToasterController | null

const toaster = getToaster()
toaster?.update({ theme: 'dark' })
```

#### `resetToasts()`

Drop every toast (active and dismissed) and rewind the internal counter. Intended for tests and dev tools. The toaster container is **not** touched.

```ts
function resetToasts(): void
```

```ts
beforeEach(() => {
  resetToasts()
})
```

### Controller surface

The object returned by `createToaster` (and `mountToaster`):

```ts
interface ToasterController {
  readonly element: HTMLElement
  readonly options: ToasterOptions
  update: (options?: ToasterOptions) => ToasterController
  destroy: () => void
}
```

- `element` — the `<ol data-notify-toaster>` mounted on `document.body` (or whatever root you pass to `mountToaster`).
- `options` — the current merged `ToasterOptions`. `update(options)` mutates the internal state and re-renders.
- `update(options?)` — re-applies the data-attributes, the CSS variables, and the active timers. Returns the same controller.
- `destroy()` — clears all timers, removes all event listeners, and removes the `<ol>` from the DOM. Idempotent.

### Registry helpers (vanilla)

#### `browser`

```ts
const browser: NotifyApi
```

Module-level singleton. Exposes `toast`, `Toaster`, `createToaster`, `configureToaster`, `getToaster`, and `destroyToaster`. Spread it into your own globals or call its methods directly. Because it shares the same module-level `Observer` and the same toaster singleton as the named exports, every spread behaves the same — `window.MyNotify.createToaster({})` and `createToaster({})` end up calling the same factory and updating the same DOM container.

For an equivalent surface in a no-bundler setup, see the [Browser global reference](/notify/reference/browser/).
