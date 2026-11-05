---
title: 'resetToasts'
description: 'Drop every toast, clear the history, and rewind the generated-id counter.'
locale: en
sidebar:
  group: api
  order: 6
---

Drop every toast, active and dismissed, and rewind the generated-id counter. It is intended for tests and development tools.

## Signature

```ts
function resetToasts(): void
```

## Returns

`void`.

## Behaviour

1. Publishes a dismissal for every active record, so the mounted renderer removes them and the dismissal callbacks run.
2. Clears the active records, the dismissed ids, and the history.
3. Rewinds the generated-id counter to `1`, so the next `toast(...)` call returns `1` again.
4. Preserves the mounted subscribers, so the current toaster stays subscribed and future events still render.

The toaster container is **not** unmounted. It stays mounted with no items in it. To unmount the container as well, call [`destroyToaster`](../destroy-toaster/).

## Examples

### Test setup

```ts
import { resetToasts } from '@samline/notify'

beforeEach(() => {
  resetToasts()
})
```

`resetToasts` is the right tool for unit tests of code that calls `toast.*`. It makes every test start from a clean counter and an empty queue.

<span id="dev-tools" class="legacy-fragment" aria-hidden="true"></span>

### Development tools

```ts
import { resetToasts } from '@samline/notify'

// Clear the screen while developing.
resetToasts()
```

## Edge cases

- **Does not unmount the toaster container.** Use [`destroyToaster`](../destroy-toaster/) for that.
- **Mounted subscribers are preserved.** The current renderer keeps working, and the next toast renders normally.
- **Direct mounts using global state also receive dismissals.** Their containers stay mounted and subscribed. Only mounts with a separately injected state are isolated from this reset.
- **The low-level `resetToastState()` is different.** It also drops every subscriber, so existing containers become stale and must be destroyed and remounted.

## Related

- [`toast.dismiss`](../toast/) — drop toasts without rewinding the counter.
- [`destroyToaster`](../destroy-toaster/) — unmount the container as well.
- [Toast lifecycle](../../guides/toast-lifecycle/)
