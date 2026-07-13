# `destroyToaster()`

Unmount the singleton toaster and drop all in-flight toasts. No-op if no toaster is mounted.

## Signature

```ts
function destroyToaster(): void
```

## Returns

`void`. Idempotent.

## Behaviour

1. Calls `toaster.destroy()` on the singleton — clears every active timer, removes every event listener, and removes the `<ol data-notify-toaster>` from the DOM.
2. Clears the singleton slot so `getToaster()` returns `null` afterwards.
3. Calls `toast.dismiss()` to drop every toast in the `Observer` (active and dismissed). This is what the IIFE auto-mount expects — a fresh toaster should start with an empty list.

## Examples

### SPA route cleanup

```ts
import { createToaster, destroyToaster } from '@samline/notify'

router.on('/profile', () => {
  createToaster({ position: 'bottom-right' })
})

router.off('/profile', () => {
  destroyToaster()
})
```

### Test setup

```ts
import { destroyToaster } from '@samline/notify'

beforeEach(() => {
  destroyToaster()
})
```

`destroyToaster` is a no-op if no toaster is mounted, so it is safe to call at the top of every test.

### Manual unmount

```ts
import { createToaster, destroyToaster } from '@samline/notify'

createToaster({ position: 'top-right' })

// ...later, when the page unmounts...
destroyToaster()
```

## Edge cases

- **No-op when nothing is mounted.** `destroyToaster` does not throw; it returns immediately.
- **Drops all in-flight toasts.** After `destroyToaster`, `toast.getToasts()` returns `[]`. The history (`toast.getHistory()`) is also empty because `toast.dismiss()` (called internally) marks every id as dismissed, but the next call to `resetToasts()` rewinds the counter for the next mount.
- **`mountToaster` controllers are not affected.** If you built a second toaster with `mountToaster`, it is independent of the singleton and `destroyToaster` does not touch it. Call `controller.destroy()` directly on the second one.

## Related

- [`createToaster`](create-toaster.md) — mount the singleton.
- [`getToaster`](get-toaster.md) — read the singleton.
- [`resetToasts`](reset-toasts.md) — drop toasts without unmounting the container.
