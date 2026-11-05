# createToaster

Mount, or update, the singleton toaster and return its controller. It is idempotent: calling it twice with different options applies the difference through `controller.update()`.

## Signature

```ts
function createToaster(options?: ToasterOptions): ToasterController
```

## Parameters

| Name      | Type             | Required | Description                                           |
| --------- | ---------------- | -------- | ----------------------------------------------------- |
| `options` | `ToasterOptions` | no       | The toaster configuration. Every field has a default. |

## Returns

A `ToasterController`. It is the same instance on every call, because there is exactly one singleton per page.

## Throws

- `Error('createToaster() requires a DOM environment (browser)')` when it is called in a context without a DOM, such as server-side rendering.
- `Error('createToaster() requires document.body; call it after DOMContentLoaded')` when `document.body` does not exist yet.

## Behaviour

### First call

1. Mounts the container with the `data-notify-toaster` attribute on `document.body`.
2. Applies the data attributes and the CSS custom properties the stylesheet reads, including the offsets, the width, and the gap.
3. Subscribes to the shared observer. Every toast create, update, and dismiss is rendered to the DOM.
4. Stores the controller in the singleton slot.

### Subsequent calls

If a controller is already mounted, `createToaster` calls `controller.update(options)` with the new options and returns the same controller. The existing container and its active toasts stay in place. Only the data attributes, the CSS variables, and the timers change.

## Examples

### Mount a default toaster

```ts
import { createToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster()
```

The container is mounted at `bottom-right` with the `light` theme and every other default. The first `toast(...)` call now has somewhere to render.

### Mount a configured toaster

```ts
import { createToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({
  position: 'top-right',
  theme: 'dark',
  richColors: true,
  duration: 5000,
  visibleToasts: 4,
  offset: 24,
  mobileOffset: 16
})
```

### Update later

```ts
import { createToaster } from '@samline/notify'

const toaster = createToaster({ position: 'bottom-right' })

// The user toggles dark mode.
toaster.update({ theme: 'dark' })

// The user resizes to a small viewport.
toaster.update({ position: 'bottom-center' })
```

### Use the returned controller

```ts
import { createToaster, getToaster } from '@samline/notify'

createToaster({ position: 'bottom-right' })

const controller = getToaster()
controller?.element // the mounted container element
controller?.options // the current merged options
```

## Edge cases

- **Server-side rendering.** It throws. The standalone build guards the same call against a missing DOM and skips it.
- **Multiple toasters on the same page.** The singleton is the only one `createToaster` knows about. For a multi-toaster interface, call `mountToaster` directly and keep your own map of controllers.
- **`mountToaster` versus `createToaster`.** `mountToaster` is the lower-level escape hatch: it accepts a root, returns a fresh controller per call, and does not touch the singleton. `createToaster` is the high-level entry point that routes through the singleton.
- **Reusing the singleton.** The active timers and the existing elements are kept. New options take effect immediately.

## Related

- [`configureToaster`](configure-toaster.md) — the intent-revealing alias.
- [`destroyToaster`](destroy-toaster.md) — unmount the singleton.
- [`getToaster`](get-toaster.md) — read the singleton.
- [Configuration](../options.md)
