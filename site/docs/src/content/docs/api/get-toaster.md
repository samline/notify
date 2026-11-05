---
title: 'getToaster'
description: 'Return the singleton toaster controller, or null when none is mounted.'
locale: en
sidebar:
  group: api
  order: 4
---

Return the singleton toaster controller, or `null` when none is mounted.

## Signature

```ts
function getToaster(): ToasterController | null
```

## Returns

A `ToasterController` when one is mounted, or `null` otherwise. The reference is the same instance on every call, because there is exactly one singleton per page. This function never mounts anything.

## Examples

### Inspect the mounted toaster

```ts
import { createToaster, getToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ position: 'bottom-right' })

const controller = getToaster()
controller?.element // the mounted container element
controller?.options // the current merged options
```

### Guard before calling

```ts
import { getToaster } from '@samline/notify'

function updateTheme(theme: 'light' | 'dark') {
  const toaster = getToaster()

  if (!toaster) {
    console.warn('No toaster mounted — call createToaster() first.')
    return
  }

  toaster.update({ theme })
}
```

<span id="live-updates-from-a-router--store" class="legacy-fragment" aria-hidden="true"></span>

### Live updates from a store

```ts
import { getToaster } from '@samline/notify'

store.subscribe(state => {
  getToaster()?.update({ theme: state.theme, position: state.position })
})
```

## Edge cases

- **`null` when no toaster is mounted.** Call `createToaster()` first.
- **Controllers from `mountToaster` are not returned.** `getToaster` only sees the singleton. If you built a second toaster with `mountToaster`, keep your own reference.
- **The reference is stable across calls.** `toaster.update(...)` mutates its internal state, but the reference does not change.

## Related

- [`createToaster`](../create-toaster/) — mount the singleton.
- [`destroyToaster`](../destroy-toaster/) — unmount the singleton.
- [Toast lifecycle](../../guides/toast-lifecycle/)
