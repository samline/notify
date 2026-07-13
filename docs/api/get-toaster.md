# `getToaster()`

Return the singleton toaster controller, or `null` if none is mounted.

## Signature

```ts
function getToaster(): ToasterController | null
```

## Returns

A [`ToasterController`](../typescript.md#toastercontroller) when one is mounted, or `null` otherwise. The reference is the same instance every call — there is exactly one singleton per page.

## Examples

### Inspect the mounted toaster

```ts
import { createToaster, getToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ position: 'bottom-right' })

const controller = getToaster()
controller?.element  // <ol data-notify-toaster ...>
controller?.options  // { position: 'bottom-right', ... }
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

### Live updates from a router / store

```ts
import { getToaster } from '@samline/notify'

store.subscribe((state) => {
  getToaster()?.update({ theme: state.theme, position: state.position })
})
```

## Edge cases

- **`null` when no toaster is mounted.** The function does not auto-mount — call `createToaster()` first.
- **`mountToaster` controllers are not returned.** `getToaster` only sees the singleton. If you built a second toaster with `mountToaster`, keep your own reference.
- **The reference is stable across calls.** The returned object is the same `ToasterController` instance for the lifetime of the toaster. `toaster.update(...)` mutates its internal state but the reference does not change.

## Related

- [`createToaster`](create-toaster.md) — mount the singleton.
- [`destroyToaster`](destroy-toaster.md) — unmount the singleton.
- [`mountToaster`](../getting-started.md#browser-registry-helpers) — lower-level factory for multi-toaster UIs.
