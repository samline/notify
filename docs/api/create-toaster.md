# `createToaster(options?)`

Mount (or update) the singleton toaster and return its controller. Idempotent: calling it twice with different options applies the diff via `controller.update()`.

## Signature

```ts
function createToaster(options?: ToasterOptions): ToasterController
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | [`ToasterOptions`](../options.md#toasteroptions) | no | The toaster configuration. Every field has a default. |

## Returns

A [`ToasterController`](../typescript.md#toastercontroller). The same instance every call — there is exactly one singleton per page.

## Throws

- `Error('createToaster() requires a DOM environment (browser)')` when called in a non-DOM context (e.g. server-side rendering with no `window`).

## Behaviour

### First call

1. Mounts a `<ol data-notify-toaster>` on `document.body` (or whatever root you pass to `mountToaster`).
2. Applies the data-attributes (`data-x-position`, `data-y-position`, `data-notify-theme`, `data-rich-colors`, `data-lifted`) and the CSS variables (`--offset-*`, `--mobile-offset-*`, `--width`, `--gap`).
3. Subscribes to the shared `Observer`. Every toast create / update / dismiss is rendered to the DOM.
4. Stores the controller in the singleton slot.

### Subsequent calls

If a controller is already mounted, `createToaster` calls `controller.update(options)` with the new options and returns the same controller. The existing `<ol>` and its active toasts stay in place — only the data-attributes and CSS variables change.

## Examples

### Mount a default toaster

```ts
import { createToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster()
```

The container is mounted at `bottom-right` with `theme: 'light'`, `richColors: false`, and the rest of the defaults. The first `toast(...)` call has somewhere to render.

### Mount a custom toaster

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

// User toggles dark mode.
toaster.update({ theme: 'dark' })

// User resizes to a small viewport.
toaster.update({ position: 'bottom-center' })
```

### Use the returned controller

```ts
import { createToaster, getToaster } from '@samline/notify'

createToaster({ position: 'bottom-right' })

const controller = getToaster()
controller?.element  // <ol data-notify-toaster data-x-position="right" data-y-position="bottom" ...>
controller?.options  // { position: 'bottom-right', ... }
```

## Edge cases

- **Server-side rendering**: throws. The IIFE bundle guards the same call against `canUseDOM()` and skips it.
- **Multiple toasters on the same page**: the singleton is the only one `createToaster` knows about. For multi-toaster UIs, use `mountToaster` directly and keep your own map of controllers.
- **`mountToaster` vs `createToaster`**: `mountToaster` is the lower-level escape hatch — it accepts a `root`, returns a fresh controller per call, and does not touch the singleton. `createToaster` is the high-level entry point that routes through the singleton.
- **Re-using the singleton across `createToaster` calls**: the active timers and the existing `<li>` elements are kept. New options take effect immediately on the next render.

## Related

- [`configureToaster`](configure-toaster.md) — intent-revealing alias of `createToaster`.
- [`destroyToaster`](destroy-toaster.md) — unmount the singleton.
- [`getToaster`](get-toaster.md) — read the singleton.
- [`mountToaster`](../getting-started.md#browser-registry-helpers) — lower-level factory for multi-toaster UIs.
