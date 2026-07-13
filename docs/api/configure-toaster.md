# `configureToaster(options?)`

Intent-revealing alias of [`createToaster`](create-toaster.md). Same signature, same return type, same behaviour.

## Signature

```ts
function configureToaster(options?: ToasterOptions): ToasterController
```

## When to use it

The two names exist to express intent at the call site:

- `createToaster` — "I want to mount a fresh toaster (or update the existing one)."
- `configureToaster` — "I want to tweak the existing toaster's configuration."

In practice they are the same function — the singleton is mounted if missing, and updated in place if present. Pick the name that reads better in your call site:

```ts
// At app entry — "create the toaster."
createToaster({ position: 'bottom-right', theme: 'dark' })

// Later, in a settings panel — "configure the existing toaster."
configureToaster({ duration: 8000 })
```

## Returns

A [`ToasterController`](../typescript.md#toastercontroller). The same instance every call.

## Examples

```ts
import { configureToaster } from '@samline/notify'
import '@samline/notify/styles.css'

configureToaster({
  position: 'top-right',
  richColors: true
})

// Update on theme change.
configureToaster({ theme: 'dark' })
```

## Edge cases

Identical to [`createToaster`](create-toaster.md). Throws on non-DOM, idempotent on existing singletons, and does not touch `mountToaster` controllers.

## Related

- [`createToaster`](create-toaster.md) — the canonical entry.
- [`destroyToaster`](destroy-toaster.md) — unmount.
- [`getToaster`](get-toaster.md) — read.
