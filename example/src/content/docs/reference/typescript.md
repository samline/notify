---
title: TypeScript reference
description: Every exported type, callback signature, and helper return shape in @samline/notify.
template: doc
sidebar:
  order: 4
---

This page lists every type exported from `@samline/notify`, what it represents, and where it shows up. Each type links to the method(s) that consume or produce it.

All types are exported from the package root:

```ts
import type {
  // toast factory
  ToastApi,
  ToastId,
  ToastType,
  Renderable,
  RenderableOrFactory,
  CustomContent,
  ToastAction,
  ToastOptions,
  ToastT,
  ToastToDismiss,
  ToastInput,
  ToastSubscriber,

  // toaster controller
  ToasterController,
  ToasterOptions,
  Position,
  Theme,
  Direction,
  Offset,
  SwipeDirection,

  // promise helper
  PromiseInput,
  PromiseValue,
  PromiseData,
  PromiseExtendedResult,

  // browser
  NotifyApi
} from '@samline/notify'
```

## `ToastApi`

The shape of the [`toast`](/notify/reference/api/#toastmessage-options) factory. It is callable (the top-level signature) and carries every variant on its surface.

```ts
interface ToastApi {
  (message: Renderable, options?: ToastOptions): ToastId
  success: (message: Renderable, options?: ToastOptions) => ToastId
  error: (message: Renderable, options?: ToastOptions) => ToastId
  info: (message: Renderable, options?: ToastOptions) => ToastId
  warning: (message: Renderable, options?: ToastOptions) => ToastId
  loading: (message: Renderable, options?: ToastOptions) => ToastId
  message: (message: Renderable, options?: ToastOptions) => ToastId
  custom: (content: CustomContent, options?: ToastOptions) => ToastId
  promise: <Data>(
    promise: PromiseInput<Data>,
    data?: PromiseData<Data>
  ) => { id?: ToastId; unwrap: () => Promise<Data> }
  dismiss: (id?: ToastId) => ToastId | undefined
  getHistory: () => ToastT[]
  getToasts: () => ToastT[]
}
```

## `ToastId`

```ts
type ToastId = number | string
```

The stable identity of a toast. Re-using an id updates the existing toast in place. Auto-incremented when omitted.

## `ToastType`

```ts
type ToastType =
  'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default'
```

`'default'` is the legacy alias for `'normal'` and renders identically. `'loading'` is the only variant that suppresses the auto-dismiss timer.

## `Renderable`

```ts
type Renderable = string | number | boolean | null | undefined
```

Anything safely renderable as text. Booleans render as `'true'` or `''`; `null` and `undefined` render as nothing. The renderer does **not** accept `ReactNode`, `HTMLElement`, or JSX — see [`CustomContent`](#customcontent) for rich content.

## `RenderableOrFactory`

```ts
type RenderableOrFactory = Renderable | (() => Renderable)
```

A function is invoked once on creation. Useful for lazy titles / descriptions that depend on current locale or runtime state. The return value is persisted on the toast, so the function is only called once per toast.

## `CustomContent`

```ts
type CustomContent = HTMLElement | ((container: HTMLElement) => void)
```

The argument to [`toast.custom`](/notify/reference/api/#toastcustom).

- Pass a pre-built `HTMLElement` you own — the renderer appends it as-is.
- Pass a callback `(container) => void` — the renderer appends an empty `<div>` to the toast and runs your callback with it as the first argument. Your callback fills the container with whatever DOM it wants.

The renderer does not touch the contents of a custom element beyond mounting it. The container for the callback is a `<div data-custom>` (a child of the `[data-icon]` slot).

## `ToastAction`

```ts
interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}
```

`closeOnClick` defaults to `true` for both `action` and `cancel`. Set it to `false` to keep the toast open after a click (e.g. for a copy-to-clipboard confirmation that should not dismiss the toast).

## `ToastOptions`

The argument to [`toast()`](/notify/reference/api/#toastmessage-options) and every variant. See the [Configuration reference](/notify/reference/configuration/#toastoptions-reference) for the field-by-field table.

```ts
interface ToastOptions {
  id?: ToastId
  toasterId?: string
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  action?: ToastAction
  cancel?: ToastAction
  testId?: string
}
```

## `ToastT`

The internal shape of a toast as the runtime holds it. Useful when you call [`toast.getHistory()`](/notify/reference/api/#toastgethistory) or [`toast.getToasts()`](/notify/reference/api/#toastgettoasts).

```ts
interface ToastT {
  id: ToastId
  toasterId?: string
  title?: RenderableOrFactory
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  position?: Position
  testId?: string
  action?: ToastAction
  cancel?: ToastAction
  custom?: CustomContent
  promise?: PromiseInput<unknown>
  delete?: boolean
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
}
```

`delete` is an internal flag the runtime uses to mark a toast that has been dismissed. Most consumers should not read it; use [`toast.getToasts()`](/notify/reference/api/#toastgettoasts) (which filters on `dismissedToasts`) instead.

## `ToastToDismiss`

```ts
interface ToastToDismiss {
  id: ToastId
  dismiss: boolean
}
```

The shape of the event the `Observer` publishes for each dismissal. Useful for advanced consumers who subscribe to the runtime directly (see [`ToastSubscriber`](#toastsubscriber)).

## `ToastInput`

The argument to `Observer.create()` — the lower-level factory that every public method routes through. Most consumers should not use this; pass through [`toast()`](/notify/reference/api/#toastmessage-options) instead.

```ts
interface ToastInput extends Omit<ToastOptions, 'description'> {
  message?: RenderableOrFactory
  description?: RenderableOrFactory
  custom?: CustomContent
}
```

## `ToastSubscriber`

```ts
type ToastSubscriber = (toast: ToastT | ToastToDismiss) => void
```

A callback that receives every event the `Observer` publishes. Every `toast.*` call publishes once; every `toast.dismiss(id)` publishes once. Subscribe to drive a custom view layer or persist the toast log.

## `ToasterController`

The shape returned by [`createToaster()`](/notify/reference/api/#createtoasteroptions) and `mountToaster()`. The runtime maintains exactly one singleton instance; `createToaster` returns it and `mountToaster` creates a fresh one each call.

```ts
interface ToasterController {
  readonly element: HTMLElement
  readonly options: ToasterOptions
  update: (options?: ToasterOptions) => ToasterController
  destroy: () => void
}
```

## `ToasterOptions`

The argument to [`createToaster()`](/notify/reference/api/#createtoasteroptions), [`configureToaster()`](/notify/reference/api/#configuretoasteroptions), and `toaster.update()`. See the [Configuration reference](/notify/reference/configuration/#toasteroptions-reference) for the field-by-field table.

```ts
interface ToasterOptions {
  id?: string
  theme?: Theme
  position?: Position
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  className?: string
  offset?: Offset
  mobileOffset?: Offset
  dir?: Direction
  richColors?: boolean
  customAriaLabel?: string
  containerAriaLabel?: string
}
```

## `Position`

```ts
type Position =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
```

The four corner positions support swipe-to-dismiss. The two centered positions do not.

## `Theme`

```ts
type Theme = 'light' | 'dark' | 'system'
```

`'system'` follows `prefers-color-scheme` via the CSS media query in the stylesheet.

## `Direction`

```ts
type Direction = 'rtl' | 'ltr' | 'auto'
```

`'auto'` reads `document.documentElement.getAttribute('dir')` and falls back to the computed CSS direction.

## `Offset`

```ts
type Offset =
  | number
  | string
  | {
      top?: number | string
      right?: number | string
      bottom?: number | string
      left?: number | string
    }
```

Numeric values get a `px` suffix; strings are forwarded verbatim. Each side falls back to `VIEWPORT_OFFSET` (24px desktop) or `MOBILE_VIEWPORT_OFFSET` (16px mobile) when omitted.

## `SwipeDirection`

```ts
type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'
```

The directions a toast can be swiped in. The runtime derives the default set from the toaster position (e.g. `'top-right'` → `['top', 'right']`).

## `PromiseInput`

```ts
type PromiseInput<ToastData = unknown> = Promise<ToastData> | (() => Promise<ToastData>)
```

A `Promise` or a thunk that returns one. Use the thunk form when the work should be deferred (e.g. when the toast is shown but the fetch should not start until after a debounce).

## `PromiseValue`

```ts
type PromiseValue<Data = unknown> =
  | Renderable
  | PromiseExtendedResult
  | ((
      data: Data
    ) => Renderable | PromiseExtendedResult | Promise<Renderable | PromiseExtendedResult>)
```

The shape of each of the `success` / `error` fields of [`PromiseData`](#promisedata). A `Renderable` renders the message directly; a [`PromiseExtendedResult`](#promiseextendedresult) lets you override the toast type / description in the settled toast.

## `PromiseData`

```ts
interface PromiseData<ToastData = unknown> extends Omit<ToastOptions, 'description'> {
  loading?: Renderable
  success?: PromiseValue<ToastData>
  error?: PromiseValue
  description?: Renderable | ((data: ToastData | unknown) => Renderable | Promise<Renderable>)
  finally?: () => void | Promise<void>
}
```

The argument to [`toast.promise`](/notify/reference/api/#toastpromise). Drop `loading` to skip the initial loading toast and only render the settled one. `finally` runs after the promise settles regardless of outcome.

## `PromiseExtendedResult`

```ts
interface PromiseExtendedResult extends ToastOptions {
  message: Renderable
}
```

Return one of these from a `success` / `error` callback to override the settled toast's type, description, duration, action, etc.

```ts
toast.promise(saveProfile(patch), {
  loading: 'Saving…',
  success: (profile) => ({
    message: `Saved as ${profile.name}`,
    type: 'success',
    description: 'Open your profile to confirm.',
    duration: 6000,
    action: { label: 'View', onClick: () => location.assign('/profile') }
  }),
  error: (err) => ({
    message: 'Save failed',
    type: 'error',
    description: err instanceof Error ? err.message : 'Try again in a moment'
  })
})
```

## `NotifyApi`

The shape of the [`browser`](/notify/getting-started/#browser-registry-helpers-bundler) singleton exported from the vanilla entrypoint. The IIFE bundle exposes the same shape as `window.Notify`.

```ts
interface NotifyApi {
  toast: typeof toast
  Toaster: (options?: ToasterOptions) => ToasterController
  createToaster: (options?: ToasterOptions) => ToasterController
  configureToaster: (options?: ToasterOptions) => ToasterController
  getToaster: () => ToasterController | null
  destroyToaster: () => void
}
```

`toast` is the same reference exported from `@samline/notify`. `Toaster` is an alias of `createToaster`. `configureToaster` is the intent-revealing alias of `createToaster`.

## Numeric constants

The runtime re-exports its numeric defaults so consumers can reason about timing without re-deriving the values:

```ts
import {
  VISIBLE_TOASTS_AMOUNT, // 3
  VIEWPORT_OFFSET, // '24px'
  MOBILE_VIEWPORT_OFFSET, // '16px'
  TOAST_LIFETIME, // 4000 (ms)
  TOAST_WIDTH, // 356 (px)
  GAP, // 14 (px)
  SWIPE_THRESHOLD, // 45 (px)
  TIME_BEFORE_UNMOUNT // 200 (ms)
} from '@samline/notify'
```

The values match the legacy `_runtime.ts` defaults from the multi-framework build. They are stable across patch releases.
