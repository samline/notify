# `resetToasts()`

Drop every toast (active and dismissed) and rewind the internal counter. Intended for tests and dev tools.

## Signature

```ts
function resetToasts(): void
```

## Returns

`void`.

## Behaviour

1. Empties `Observer.toasts` and `Observer.dismissedToasts`.
2. Unsubscribes every subscriber.
3. Rewinds the auto-increment counter to 1 so the next `toast(...)` call returns `1` again.

The toaster container is **not** touched — it stays mounted with no `<li>` children. To unmount the container as well, call [`destroyToaster`](destroy-toaster.md).

## Examples

### Test setup

```ts
import { resetToasts } from '@samline/notify'

beforeEach(() => {
  resetToasts()
})
```

`resetToasts` is the right tool for unit tests of code that calls `toast.*` — it makes every test start from a clean counter and an empty queue.

### Dev tools

```ts
// In the browser console.
window.Notify.resetToasts()
```

Drops every toast in flight. The auto-mount default toaster is still there for the next `Notify.toast(...)` call.

## Edge cases

- **Does not unmount the toaster container.** Use [`destroyToaster`](destroy-toaster.md) for that.
- **Subscribers stop receiving notifications.** Re-subscribe inside the next test or after the reset.
- **`mountToaster` controllers are not affected.** Their timers and `<li>` elements are independent of the singleton's `Observer`.

## Related

- [`toast.dismiss`](toast.md#toastdismiss) — drop toasts without rewinding the counter.
- [`destroyToaster`](destroy-toaster.md) — unmount the container as well.
- [`resetToastState`](../typescript.md#numeric-constants) — the internal equivalent (re-exported for advanced use).
