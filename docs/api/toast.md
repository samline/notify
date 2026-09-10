# `toast`

The main toast factory. Pushes a new toast into the `Observer` and returns the id. The renderer reconciles a `<li data-notify-toast>` for the id on the next event-loop tick.

## Signature

```ts
function toast(message: Renderable, options?: ToastOptions): ToastId
```

## Parameters

| Name      | Type                                         | Required | Description                                                                                                    |
| --------- | -------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `message` | [`Renderable`](../typescript.md#renderable)  | yes      | The title text. Strings and numbers render as `textContent`; `null` / `undefined` / `false` render as nothing. |
| `options` | [`ToastOptions`](../options.md#toastoptions) | no       | Per-toast options — `id`, `description`, `type`, `duration`, `action`, `cancel`, etc.                          |

## Returns

A [`ToastId`](../typescript.md#toastid) — `number | string`. Use it to dismiss the toast early or to update it in place.

## Examples

### Minimal

```ts
import { toast } from '@samline/notify'

toast('Hello')
```

### With description and type

```ts
toast('Saved', {
  type: 'success',
  description: 'Your profile is up to date.'
})
```

### With action

```ts
toast('Item deleted', {
  type: 'action',
  duration: 6000,
  action: {
    label: 'Undo',
    onClick: () => restoreItem()
  }
})
```

### Update in place

```ts
const id = toast('Uploading…')

await uploadFile(file)

toast.success('Upload complete', { id })
```

The second call reuses the same id, so the same `<li data-notify-toast data-id="<id>">` is updated in place — no second `<li>` is rendered. The auto-dismiss timer is also reset.

---

## `toast.variants`

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

You can still pass `duration: Infinity` on a non-loading variant to suppress the auto-dismiss.

```ts
toast.info('Long heads up', { duration: Infinity })
```

---

## `toast.custom`

Mount rich content inside a toast. Accepts either an `HTMLElement` you own or a callback that fills a container.

## Signature

```ts
function toast.custom(content: CustomContent, options?: ToastOptions): ToastId
```

`CustomContent` is `HTMLElement | ((container: HTMLElement) => void)` — see [`typescript.md`](../typescript.md#customcontent).

### Pre-built element

```ts
const widget = document.createElement('div')
widget.textContent = 'Pre-built widget'

toast.custom(widget, { duration: 8000 })
```

The renderer appends `widget` directly. The toast body shows whatever the element renders to. The runtime does not wrap the element in any additional container.

### Callback

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

The renderer creates a `<div data-custom>` for you and passes it as the only argument. Your callback fills it with whatever DOM you own.

> **Security note:** do not interpolate user-supplied HTML as `innerHTML`. Build DOM nodes (`createElement`, `textContent`) instead. The runtime does not sanitize custom content.

### Caveats

- The icon slot is replaced by the custom content — no icon, no loader.
- The close button is rendered as usual (when `closeButton` is enabled), so consumers can still dismiss the toast.
- The custom element is removed when the toast is dismissed and the unmount grace period (`TIME_BEFORE_UNMOUNT` = 200ms) elapses.

---

## `toast.promise`

Tie a loading → success/error transition to a real `Promise`. Reuses one id, so the DOM updates in place.

## Signature

```ts
function toast.promise<Data>(
  promise: PromiseInput<Data>,
  data?: PromiseData<Data>
): { id?: ToastId; unwrap: () => Promise<Data> }
```

`PromiseInput` is `Promise<Data> | (() => Promise<Data>)`. The thunk form defers the work until after the loading toast is rendered.

`PromiseData` is:

```ts
interface PromiseData<ToastData = unknown> extends Omit<ToastOptions, 'description'> {
  loading?: Renderable
  success?: PromiseValue<ToastData>
  error?: PromiseValue
  description?: Renderable | ((data: ToastData | unknown) => Renderable | Promise<Renderable>)
  finally?: () => void | Promise<void>
}
```

### Basic flow

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

### Return shape

`toast.promise` returns `{ id, unwrap }` when `data.loading` is set; otherwise `{ unwrap }`. The `id` is the same id used for the loading and settled toasts. `unwrap` resolves to the original `Promise`'s resolved value, or rejects with the rejection reason. Use it when you need to await the outcome yourself.

```ts
const { id, unwrap } = toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Could not save'
})

try {
  await unwrap()
  // The success toast is already on screen.
} catch (err) {
  // The error toast is already on screen.
  console.error(err)
}
```

### `success` / `error` callbacks

Each of `success` and `error` accepts either a `Renderable` (the message), a [`PromiseExtendedResult`](../typescript.md#promiseextendedresult) (an options-shaped object that lets you set `type`, `description`, `duration`, `action`, etc.), or a callback returning either:

```ts
toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: (profile) => ({
    message: `Saved as ${profile.name}`,
    type: 'success',
    description: 'Open your profile to confirm.',
    action: { label: 'View', onClick: () => location.assign('/profile') }
  }),
  error: (err) => ({
    message: 'Save failed',
    type: 'error',
    description: err instanceof Error ? err.message : 'Try again in a moment'
  })
})
```

### Deferred work

```ts
toast.promise(() => fetch('/api/profile').then((r) => r.json()), {
  loading: 'Loading…',
  success: (p) => p.name,
  error: 'Failed'
})
```

The thunk form runs after the loading toast is on screen. Use it when the work should be deferred (e.g. behind a debounce or a click).

### Skip the loading toast

Drop the `loading` key to only render the settled toast:

```ts
toast.promise(
  fetch('/api/profile').then((r) => r.json()),
  { success: (p) => `Loaded ${p.name}`, error: 'Failed' }
)
```

The return shape in that case is `{ unwrap }` (no `id`).

---

## `toast.dismiss`

Drop one toast or every active toast.

## Signature

```ts
function toast.dismiss(id?: ToastId): ToastId | undefined
```

### Examples

```ts
// Drop every active toast.
toast.dismiss()

// Drop a specific toast.
const id = toast('Saved')
toast.dismiss(id)
```

The `<li>` is marked `data-removed="true"` so the exit transition runs. The actual DOM removal is scheduled after `TIME_BEFORE_UNMOUNT` (200ms by default). The id remains in the history returned by `toast.getHistory()`.

---

## `toast.getHistory`

Read-only snapshot of every toast since page load, including dismissed ones.

## Signature

```ts
function toast.getHistory(): ToastT[]
```

## Returns

A fresh array of [`ToastT`](../typescript.md#toastt). Safe to mutate. The internal array is left intact.

```ts
const all = toast.getHistory()

console.log(`There have been ${all.length} toasts since page load.`)
```

---

## `toast.getToasts`

Read-only snapshot of every active toast (not yet dismissed).

## Signature

```ts
function toast.getToasts(): ToastT[]
```

## Returns

A fresh array of [`ToastT`](../typescript.md#toastt). Safe to mutate. This is what the renderer iterates over on every event.

```ts
const active = toast.getToasts()

if (active.length >= 3) {
  toast.dismiss(active[0].id) // Drop the oldest to make room.
}
```

---

## Edge cases

- **Auto-increment id**: when `options.id` is omitted, the runtime assigns the next integer. The counter starts at 1 and is rewound by [`resetToasts()`](reset-toasts.md).
- **Same id with different type**: re-using an id updates the existing toast in place. The runtime fingerprints the content (type, title, description, action, cancel) and re-fills only when one of those fields changed.
- **Empty title**: `toast('')` or `toast(undefined)` renders a `<li>` with an empty `[data-title]`. The stylesheet still applies the visual treatment.
- **Function title**: a `RenderableOrFactory` is invoked once on creation. The result is persisted on the toast, so the function is only called once per toast.
- **Loading variant never auto-dismisses**: `toast.loading` does not schedule a timer. Resolve it manually with `toast.success(..., { id })` or `toast.error(..., { id })`.
- **Promise responses**: when the resolved value is a `Response` with `ok === false`, the runtime routes to the `error` callback instead of `success`. Non-Response errors are caught and routed to `error` as well.

## Related

- [`toast.success` / `error` / `info` / `warning` / `loading` / `message`](#toastvariants) — sugar for `toast(..., { type })`.
- [`toast.custom`](#toastcustom) — rich content.
- [`toast.promise`](#toastpromise) — async transitions.
- [`toast.dismiss`](#toastdismiss) — early dismiss.
- [`createToaster`](create-toaster.md) — the toaster controller that renders the DOM.
