# Promise API

`toast.promise()` connects asynchronous work to optional loading, success, and error notifications without changing the original outcome.

## Signature

```ts
function toast.promise<Data>(
  input: Promise<Data> | (() => Promise<Data>),
  data?: PromiseData<Data>
): { id: ToastId; unwrap: () => Promise<Data> } | { id?: undefined; unwrap: () => Promise<Data> }
```

With `data`, a thunk runs immediately and synchronous throws become rejections. Without `data`, no toast is rendered and a thunk is deferred until each `unwrap()` call.

## Loading and settled states

When `loading` exists, Notify creates a persistent loading toast and returns its id. A later success or error reuses that id. Without `loading`, a settled message can still create a toast, but its generated id is not added retroactively to the returned object.

Success and error values can be text, an extended `{ message, ...toastOptions }` object, or a sync/async callback returning either form.

```ts
const operation = toast.promise(() => fetch('/api/report'), {
  loading: 'Creating report',
  success: 'Report created',
  error: (response) =>
    response instanceof Response ? `Request failed: ${response.status}` : 'Request failed'
})

const response = await operation.unwrap()
```

## HTTP and Error values

| Original result                      | Display path | `unwrap()`                       |
| ------------------------------------ | ------------ | -------------------------------- |
| Fulfilled ordinary value             | Success      | Fulfills with the value          |
| Fulfilled non-ok response-like value | Error        | Still fulfills with the response |
| Fulfilled `Error` object             | Error        | Still fulfills with the `Error`  |
| Rejection                            | Error        | Rejects with the original reason |

Notify does not parse responses or turn HTTP failures into thrown errors. Do that conversion in the input function when your application requires rejection semantics.

## Description, finally, and unwrap

A static `description` appears on loading and settled states. A description function runs only on the error path. `finally` runs after the selected renderer and may be async. `unwrap()` waits for rendering, then preserves the original fulfillment or rejection.

Errors thrown by rendering callbacks or `finally` do not replace the original `unwrap()` outcome.

## Guidance

- Use a loading toast only for work long enough to notice.
- Give manual loading states a terminal update or explicit dismissal.
- Prefer specific labels such as `Uploading invoice`.
- Keep settled messages visible long enough to read.

See [Recipes](recipes.md) and the [`toast` API](api/toast.md).
