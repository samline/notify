# configureToaster

The intent-revealing alias of `createToaster`. It has the same signature, the same return type, and the same behavior.

## Signature

```ts
function configureToaster(options?: ToasterOptions): ToasterController
```

## When to use it

The two names exist to express intent at the call site:

- `createToaster` — "I want to mount a toaster, or update the existing one."
- `configureToaster` — "I want to tweak the existing toaster's configuration."

In practice they are the same function. The singleton is mounted if it is missing, and updated in place if it is present. Pick the name that reads better in your call site:

```ts
// At app entry — "create the toaster."
createToaster({ position: 'bottom-right', theme: 'dark' })

// Later, in a settings panel — "configure the existing toaster."
configureToaster({ duration: 8000 })
```

## Returns

A `ToasterController`. It is the same instance on every call.

## Examples

```ts
import { configureToaster } from '@samline/notify'
import '@samline/notify/styles.css'

configureToaster({
  position: 'top-right',
  richColors: true
})

// Update on a theme change.
configureToaster({ theme: 'dark' })
```

## Edge cases

Identical to [`createToaster`](create-toaster.md). It throws in a non-DOM context, it is idempotent against an existing singleton, and it does not touch controllers created by `mountToaster`.

## Related

- [`createToaster`](create-toaster.md) — the canonical entry.
- [`destroyToaster`](destroy-toaster.md) — unmount.
- [`getToaster`](get-toaster.md) — read.
