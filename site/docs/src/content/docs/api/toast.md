---
title: 'toast'
description: 'The toast factory, its variants, custom content, promise transitions, dismissal, and state snapshots.'
locale: en
sidebar:
  group: api
  order: 1
---

The main toast factory. It pushes a new toast into the shared observer and returns its id. The renderer reconciles one list item for that id on the next event-loop tick.

## Signature

```ts
function toast(message: Renderable, options?: ToastOptions): ToastId
```

## Parameters

| Name      | Type           | Required | Description                                                                                                        |
| --------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `message` | `Renderable`   | yes      | The title text. Strings and numbers render as `textContent`; `null`, `undefined`, and `false` render as nothing.   |
| `options` | `ToastOptions` | no       | Per-toast options: `id`, `description`, `type`, `duration`, `action`, `cancel`, and the rest of the toast options. |

## Returns

A `ToastId`, which is `number | string`. Use it to dismiss the toast early or to update it in place.

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
  description: 'Your profile is up to date.',
})
```

### With action

```ts
toast('Item deleted', {
  type: 'action',
  duration: 6000,
  action: {
    label: 'Undo',
    onClick: () => restoreItem(),
  },
})
```

### Update in place

```ts
const id = toast('Uploading…')

await uploadFile(file)

toast.success('Upload complete', { id })
```

The second call reuses the same id, so the same element is updated in place. No second item is rendered, and the auto-dismiss timer is reset.

## `toast.variants`

The variant helpers are sugar for `toast(message, { ...options, type: 'X' })`. Every one returns a `ToastId` and accepts the same `ToastOptions` shape.

```ts
toast.success(message, options?)
toast.error(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.loading(message, options?)
toast.message(message, options?) // alias of the callable form
```

The only difference between the variants is the type they set:

| Variant         | Forced `type` | Auto-dismiss                                 |
| --------------- | ------------- | -------------------------------------------- |
| `toast.success` | `'success'`   | yes                                          |
| `toast.error`   | `'error'`     | yes                                          |
| `toast.info`    | `'info'`      | yes                                          |
| `toast.warning` | `'warning'`   | yes                                          |
| `toast.loading` | `'loading'`   | **no**; resolve it manually with the same id |
| `toast.message` | `'normal'`    | yes                                          |
| `toast(...)`    | `'normal'`    | yes                                          |

You can still pass `duration: Infinity` on a non-loading variant to suppress the auto-dismiss:

```ts
toast.info('Long heads up', { duration: Infinity })
```

## `toast.custom`

Mount rich content inside a toast. It accepts either an `HTMLElement` you own or a callback that fills a container.

### Signature

```ts
function toast.custom(content: CustomContent, options?: ToastOptions): ToastId
```

`CustomContent` is `HTMLElement | ((container: HTMLElement) => void)`.

### Pre-built element

```ts
const widget = document.createElement('div')
widget.textContent = 'Pre-built widget'

toast.custom(widget, { duration: 8000 })
```

The renderer appends the element directly, without an extra wrapper.

### Callback

```ts
toast.custom(container => {
  const img = document.createElement('img')
  img.src = '/avatars/sam.png'
  img.alt = ''
  img.width = 32
  img.height = 32

  const text = document.createElement('div')
  text.innerHTML = `
    <div data-title>Sam liked your post</div>
    <div data-description>5 minutes ago</div>
  `

  container.appendChild(img)
  container.appendChild(text)
})
```

The renderer creates the mount element and passes it as the only argument. Your callback fills it with whatever DOM you own.

### Caveats

- The custom content replaces the icon slot, so there is no icon and no loader.
- No close button is generated for custom content, even when `closeButton` is enabled. Give the content its own dismissal control if it needs one.
- The custom element is removed when the toast is dismissed and the unmount grace period elapses.
- The runtime does not sanitize your DOM. Never interpolate user-supplied HTML as `innerHTML`.

## `toast.promise`

Tie a loading to success or error transition to a real promise. It reuses one id, so the DOM updates in place.

### Signature

```ts
function toast.promise<Data>(
  input: PromiseInput<Data>,
  data?: PromiseData<Data>
): { id?: ToastId; unwrap: () => Promise<Data> }
```

`PromiseInput` is `Promise<Data> | (() => Promise<Data>)`. The thunk form defers the work until the loading toast has been rendered.

### Basic flow

```ts
toast.promise(fetchProfile(), {
  loading: 'Loading profile…',
  success: data => `Hi ${data.name}`,
  error: 'Could not load profile',
})
```

The loading toast appears immediately, or not at all if you omit it. Once the promise settles, the same id is updated in place:

- If the resolved value is a response whose `ok` is `false`, or it is an `Error`, the `error` value is used.
- Otherwise the `success` value is used with the resolved value.
- `finally` runs after the settled toast renders, regardless of the outcome.

### Return shape

`toast.promise` returns an object with an `id` and an `unwrap` function. The `id` is present only when `data.loading` is set; it is the same id used for the loading and the settled toast. `unwrap` resolves to the original promise's value, or rejects with the original rejection reason.

```ts
const { id, unwrap } = toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Could not save',
})

try {
  await unwrap()
  // The success toast is already on screen.
} catch (err) {
  // The error toast is already on screen.
  console.error(err)
}
```

### `success` and `error` callbacks

Each of `success` and `error` accepts either a `Renderable` message, a `PromiseExtendedResult` object that lets you set `type`, `description`, `duration`, `action`, and the rest of the toast options, or a callback returning either form:

```ts
toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: profile => ({
    message: `Saved as ${profile.name}`,
    type: 'success',
    description: 'Open your profile to confirm.',
    action: { label: 'View', onClick: () => location.assign('/profile') },
  }),
  error: err => ({
    message: 'Save failed',
    type: 'error',
    description: err instanceof Error ? err.message : 'Try again in a moment',
  }),
})
```

### Deferred work

```ts
toast.promise(() => fetch('/api/profile').then(r => r.json()), {
  loading: 'Loading…',
  success: p => p.name,
  error: 'Failed',
})
```

The thunk form runs after the loading toast is on screen. Use it when the work should be deferred.

### Skip the loading toast

Drop the `loading` key to render only the settled toast:

```ts
toast.promise(
  fetch('/api/profile').then(r => r.json()),
  {
    success: p => `Loaded ${p.name}`,
    error: 'Failed',
  }
)
```

The return shape in that case has no `id`.

See the [Promise API](../../reference/promises/) for the full behavior of the id, the description, HTTP values, and `unwrap()`.

## `toast.dismiss`

Drop one toast or every active toast.

### Signature

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

The element is marked as removed so the exit transition runs, and the actual DOM removal is scheduled after the exit grace period. The id remains in the history returned by `toast.getHistory()`.

## `toast.getHistory`

A read-only snapshot of every toast since page load, including the dismissed ones.

### Signature

```ts
function toast.getHistory(): ToastT[]
```

### Returns

A fresh array of `ToastT` records. Safe to mutate. The internal array is left intact.

```ts
const all = toast.getHistory()

console.log(`There have been ${all.length} toasts since page load.`)
```

## `toast.getToasts`

A read-only snapshot of every active toast that has not been dismissed.

### Signature

```ts
function toast.getToasts(): ToastT[]
```

### Returns

A fresh array of `ToastT` records, newest first. Safe to mutate. This is what the renderer iterates over on every event.

```ts
const active = toast.getToasts()

if (active.length >= 3) {
  toast.dismiss(active[0].id) // Drop the oldest to make room.
}
```

## Edge cases

- **Auto-increment id.** When `options.id` is omitted, the runtime assigns the next integer. The counter starts at `1` and is rewound by `resetToasts()`.
- **Same id with a different type.** Reusing an id updates the existing toast in place. The runtime fingerprints the content and re-fills only when the type, title, description, action, or cancel changed.
- **Empty title.** `toast('')` or `toast(undefined)` renders an item with an empty title element. The stylesheet still applies the visual treatment.
- **Function title.** A `RenderableOrFactory` is invoked once on creation, and the result is persisted on the toast, so the function is only called once per toast.
- **Loading never auto-dismisses.** `toast.loading` does not schedule a timer. Resolve it manually with `toast.success(..., { id })` or `toast.error(..., { id })`.
- **Promise responses.** When the resolved value is a response whose `ok` is `false`, the runtime routes to the `error` callback instead of `success`.

## Related

- [`createToaster`](../../api/create-toaster/) — the toaster controller that renders the DOM.
- [Promise API](../../reference/promises/)
- [Configuration](../../reference/configuration/)
