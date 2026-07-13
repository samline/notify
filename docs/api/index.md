# API reference

Every public method gets its own page. Use this index to navigate to the right one.

## Toast factory

- [`toast(message, options?)`](toast.md) — the callable factory.
- [`toast.success`](toast.md#toastvariants) — `data-type="success"`.
- [`toast.error`](toast.md#toastvariants) — `data-type="error"`.
- [`toast.info`](toast.md#toastvariants) — `data-type="info"`.
- [`toast.warning`](toast.md#toastvariants) — `data-type="warning"`.
- [`toast.loading`](toast.md#toastvariants) — `data-type="loading"`. Suppresses auto-dismiss.
- [`toast.message`](toast.md#toastvariants) — explicit alias of the callable form.
- [`toast.custom`](toast.md#toastcustom) — mount rich content (HTMLElement or callback).
- [`toast.promise`](toast.md#toastpromise) — loading → success/error transition in one id.
- [`toast.dismiss`](toast.md#toastdismiss) — drop one toast or every active toast.
- [`toast.getHistory`](toast.md#toastgethistory) — readonly snapshot of every toast since page load.
- [`toast.getToasts`](toast.md#toastgettoasts) — readonly snapshot of the active toasts.

## Toaster lifecycle

- [`createToaster(options?)`](create-toaster.md) — mount the singleton toaster; idempotent.
- [`configureToaster(options?)`](configure-toaster.md) — intent-revealing alias of `createToaster`.
- [`destroyToaster()`](destroy-toaster.md) — unmount the singleton; no-op if none.
- [`getToaster()`](get-toaster.md) — read the singleton controller; `null` if none.
- [`resetToasts()`](reset-toasts.md) — drop every toast and rewind the internal counter.

## Controller surface

Methods on the object returned by `createToaster` (and `mountToaster`):

- `element` — the `<ol data-notify-toaster>` element.
- `options` — the current merged `ToasterOptions` (live).
- `update(options?)` — re-applies options and re-renders.
- `destroy()` — unmounts; idempotent.

## Registry helpers (vanilla)

- [`browser`](../getting-started.md#browser-registry-helpers) — module-level singleton with the same shape as the IIFE bundle. Use it from a bundler to compose your own global.

## Pure helpers

- `mountToaster(root, options?)` — lower-level factory for advanced consumers. Returns a fresh `ToasterController` per call.
