---
title: Promise API
description: Complete toast.promise behavior for input thunks, loading and settled states, HTTP values, and unwrap.
template: doc
sidebar:
  order: 4
---

`toast.promise()` connects asynchronous work to optional loading, success, and error notifications without changing the original outcome.

## Signature

```ts
function toast.promise<Data>(
  input: Promise<Data> | (() => Promise<Data>),
  data?: PromiseData<Data>
): { id: ToastId; unwrap: () => Promise<Data> } | { id?: undefined; unwrap: () => Promise<Data> }
```

The input can be an already-started promise or a thunk. When `data` is supplied, a thunk is called immediately and synchronous throws become promise rejections. When `data` is omitted, no toast is rendered and the thunk is deferred until `unwrap()` is called.

```ts
const result = toast.promise(
  () =>
    new Promise<{ name: string }>((resolve) => {
      window.setTimeout(() => resolve({ name: 'Sam' }), 800)
    }),
  {
    loading: 'Saving profile',
    success: (profile) => `Saved ${profile.name}`,
    error: (reason) => (reason instanceof Error ? reason.message : 'Save failed'),
    finally: () => console.log('Rendering finished')
  }
)

const profile = await result.unwrap()
```

## Loading and result ids

`loading` is optional. If present, Notify creates a non-auto-dismissing loading toast immediately and the result has an `id`. A later `success` or `error` updates that id.

If `loading` is absent, the result's `id` is `undefined`. A defined settled value creates a new toast with a generated id, but that generated id is not added retroactively to the returned object. If `success` or `error` is omitted for the selected path, no settled toast is created.

```ts
const withLoading = toast.promise(Promise.resolve('ok'), {
  loading: 'Working',
  success: 'Finished'
})
// withLoading.id is present.

const settledOnly = toast.promise(Promise.resolve('ok'), {
  success: 'Finished'
})
// settledOnly.id is undefined, even though a success toast is created.
```

## Success and error values

Both fields accept:

- a `Renderable` value;
- a `PromiseExtendedResult` object with required `message` plus toast options;
- a sync or async callback returning either form.

The success callback receives the fulfilled value. The error callback receives the rejected reason, a fulfilled non-ok `Response`, or a fulfilled `Error` value.

```ts
toast.promise(Promise.resolve({ name: 'Sam' }), {
  success: async (profile) => ({
    message: `Saved ${profile.name}`,
    description: 'The local copy is current.',
    duration: 6000,
    action: {
      label: 'View profile',
      onClick: () => location.assign('/profile')
    }
  }),
  error: (reason) => ({
    message: 'Save failed',
    description: reason instanceof Error ? reason.message : 'Try again later',
    closeButton: true
  })
})
```

An extended result is spread into the settled toast. Its options can override the default settled `type`, duration, action, classes, and other `ToastOptions` fields.

## Description behavior

`PromiseData.description` has two distinct forms:

- A static renderable appears on the loading toast, when one exists, and on the settled toast.
- A function is not shown during loading. It is called only on the error path with the error value and may return a promise. It is not called for success.

If an extended result also includes `description`, the top-level resolved promise description is applied afterward and takes precedence when it is defined.

## HTTP `Response` and `Error` values

Notify classifies values for display as follows:

| Original promise outcome                                                             | Render path | `unwrap()` outcome                      |
| ------------------------------------------------------------------------------------ | ----------- | --------------------------------------- |
| fulfills with ordinary data                                                          | `success`   | fulfills with that data                 |
| fulfills with a response-like object whose `ok` is false and numeric `status` exists | `error`     | still fulfills with that response       |
| fulfills with an `Error` object                                                      | `error`     | still fulfills with that `Error` object |
| rejects for any reason                                                               | `error`     | rejects with the original reason        |

Notify does not call `response.json()`, clone a response, or convert an HTTP response to a thrown error. If you want non-2xx responses to reject, perform that conversion in your own input function.

```ts
const request = toast.promise(() => fetch('https://jsonplaceholder.typicode.com/todos/1'), {
  loading: 'Loading example data',
  success: 'Example data loaded',
  error: (response) =>
    response instanceof Response ? `Request failed: ${response.status}` : 'Request failed'
})

const response = await request.unwrap()
```

## `finally` and `unwrap()`

`finally` runs after the selected success/error renderer finishes and may be async. `unwrap()` waits for that rendering pipeline, then preserves the original promise outcome: it returns the original fulfilled value or throws the original rejection reason.

Errors thrown by success/error rendering callbacks or `finally` do not replace the original outcome returned by `unwrap()`. They are consumed by the rendering pipeline. Use your own logging inside those callbacks if failures need reporting.

Calling `unwrap()` more than once observes the same already-created outcome when `data` was provided. In the special no-`data` thunk form, each `unwrap()` invocation calls the thunk again because no input promise was created up front.

## Loading-state guidance

- Use loading toasts only when the operation is likely to last long enough to notice.
- Always provide or schedule a terminal update for manual loading toasts; they have no timer.
- Prefer a specific loading label such as `Uploading invoice` over `Please wait`.
- Keep the settled message available long enough to read, and provide a close button for persistent results.
