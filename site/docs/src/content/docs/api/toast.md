---
title: 'toast'
description: 'The toast factory, its variants, custom content, promise transitions, dismissal, and state snapshots.'
locale: en
sidebar:
  group: api
  order: 1
---

The main toast factory. It pushes a new toast into the shared observer and returns its id. The subscribed renderer reconciles that id synchronously; the browser paints afterward.

## Signature

```ts
function toast(message: RenderableOrFactory, options?: ToastOptions): ToastId
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
toast.success('Saved', options)
toast.error('Save failed', options)
toast.info('An update is available', options)
toast.warning('Review your changes', options)
toast.loading('Saving…', options)
toast.message('Changes received', options) // alias of the callable form
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
declare namespace toast {
  function custom(content: CustomContent, options?: ToastOptions): ToastId
}
```

`CustomContent` is `HTMLElement | ((container: HTMLElement, context: CustomContentContext) => void | (() => void))`. The context holds the toast `id` and a `dismiss()` helper.

### Pre-built element

```ts
const widget = document.createElement('div')
widget.textContent = 'Pre-built widget'

toast.custom(widget, { duration: 8000 })
```

The renderer appends the element inside its div[data-custom] mount point, a direct child of the toast item.

### Callback

```ts
toast.custom(container => {
  const img = document.createElement('img')
  img.src = '/avatars/nora.png'
  img.alt = ''
  img.width = 32
  img.height = 32

  const text = document.createElement('div')
  text.innerHTML = `
    <div data-title>Nora liked your post</div>
    <div data-description>5 minutes ago</div>
  `

  container.appendChild(img)
  container.appendChild(text)
})
```

The renderer creates the mount element and passes it with a `{ id, dismiss }` context. Your callback fills it with whatever DOM you own.

### Dismiss and clean up

The callback can run again when the toaster re-renders (for example after `update()`). Return a cleanup function to release listeners; it runs before every re-render and when the toast is removed.

```ts
toast.custom((container, { dismiss }) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Got it'
  const onClick = () => dismiss()
  button.addEventListener('click', onClick)
  container.append(button)
  return () => button.removeEventListener('click', onClick)
})
```

### Caveats

- The custom content replaces the whole toast body, so there is no icon, loader, title or description.
- No close button is generated for custom content, even when `closeButton` is enabled. Give the content its own dismissal control if it needs one.
- The custom element is removed when the toast is dismissed and the unmount grace period elapses.
- The runtime does not sanitize your DOM. Never interpolate user-supplied HTML as `innerHTML`.

## `toast.promise`

Tie a loading to success or error transition to a real promise. It reuses one id, so the DOM updates in place.

### Signature

```ts
declare namespace toast {
  function promise<Data>(
    input: PromiseInput<Data>,
    data?: PromiseData<Data>
  ): { id?: ToastId; unwrap: () => Promise<Data> }
}
```

`PromiseInput` is `Promise<Data> | (() => Promise<Data>)`. When data is supplied, the thunk is invoked synchronously after the loading state is published, without waiting for a browser paint. With no data, each unwrap() call invokes the thunk.

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

<span id="success--error-callbacks" class="legacy-fragment" aria-hidden="true"></span>

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

With data supplied, the thunk runs immediately after loading is published. It does not wait for a paint, click, or debounce. Defer work in your application when that is required.

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
declare namespace toast {
  function dismiss(id?: ToastId): ToastId | undefined
}
```

### Examples

```ts
// Drop every active toast.
toast.dismiss()

// Drop a specific toast.
const id = toast('Saved')
toast.dismiss(id)
```

The element is marked as removed so the exit transition runs, and the actual DOM removal is scheduled after the exit grace period. The id remains in the history returned by `toast.getHistory()`, which keeps the newest 50 dismissed records.

## `toast.getHistory`

A defensive snapshot of the latest record for each id since the last reset, including dismissed records.

### Signature

```ts
declare namespace toast {
  function getHistory(): ToastT[]
}
```

### Returns

A fresh array of `ToastT` records. Safe to mutate. The internal array is left intact.

```ts
const all = toast.getHistory()

console.log(`There are ${all.length} records since the last reset.`)
```

## `toast.getToasts`

A read-only snapshot of every active toast that has not been dismissed.

### Signature

```ts
declare namespace toast {
  function getToasts(): ToastT[]
}
```

### Returns

A fresh array of `ToastT` records, newest first. Safe to mutate. This is what the renderer iterates over on every event.

```ts
const active = toast.getToasts()

if (active.length >= 3) {
  toast.dismiss(active.at(-1)!.id) // Drop the oldest to make room.
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

- [`createToaster`](../create-toaster/) — the toaster controller that renders the DOM.
- [Promise API](../../reference/promises/)
- [Configuration](../../reference/configuration/)
