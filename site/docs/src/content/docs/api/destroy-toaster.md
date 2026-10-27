---
title: 'destroyToaster'
description: 'Unmount the singleton toaster, publish its dismissals, and clear the registry.'
locale: en
sidebar:
  group: api
  order: 3
---

Unmount the singleton toaster and drop the toasts it was rendering. It is a no-op when no toaster is mounted.

## Signature

```ts
function destroyToaster(): void
```

## Returns

`void`. The call is idempotent.

## Behaviour

1. Calls `toast.dismiss()` while the renderer is still subscribed, so every active toast publishes its dismissal and the dismissal callbacks run before the listeners go away.
2. Calls `controller.destroy()` on the singleton. That clears every active timer, removes every event listener, and removes the container from the DOM.
3. Clears the singleton slot, so `getToaster()` returns `null` afterwards.

The state history is not cleared by this call. `toast.getToasts()` returns an empty array, while `toast.getHistory()` still lists the dismissed records until `resetToasts()` runs.

## Examples

### Router cleanup

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

`destroyToaster` is a no-op when no toaster is mounted, so it is safe to call at the top of every test.

### Manual unmount

```ts
import { createToaster, destroyToaster } from '@samline/notify'

createToaster({ position: 'top-right' })

// ...later, when the page unmounts...
destroyToaster()
```

## Edge cases

- **No-op when nothing is mounted.** It does not throw, it returns immediately.
- **Nothing remounts afterwards.** Call `createToaster()` again before you show more visible toasts.
- **Controllers from `mountToaster` are not affected.** A second toaster built with `mountToaster` is independent of the singleton, so call `controller.destroy()` directly on it.

## Related

- [`createToaster`](../../api/create-toaster/) — mount the singleton.
- [`getToaster`](../../api/get-toaster/) — read the singleton.
- [`resetToasts`](../../api/reset-toasts/) — drop toasts without unmounting the container.
