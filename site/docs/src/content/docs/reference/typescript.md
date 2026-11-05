---
title: 'TypeScript reference'
titleAccent: 'reference'
description: 'Every public type, callback shape, and constant exported by @samline/notify.'
locale: en
sidebar:
  group: reference
  order: 5
---

All names on this page are valid root exports. `RenderableOrFactory` and `ToastToDismiss` can be imported directly from `@samline/notify`.

```ts
import type {
  CustomContent,
  Direction,
  NotifyApi,
  Offset,
  Position,
  PromiseData,
  PromiseExtendedResult,
  PromiseInput,
  PromiseValue,
  Renderable,
  RenderableOrFactory,
  SwipeDirection,
  Theme,
  ToastAction,
  ToastApi,
  ToastId,
  ToastInput,
  ToastOptions,
  ToastSubscriber,
  ToastT,
  ToastToDismiss,
  ToastType,
  ToasterController,
  ToasterOptions,
} from '@samline/notify'
```

<span id="toastid" class="legacy-fragment" aria-hidden="true"></span>
<span id="toasttype" class="legacy-fragment" aria-hidden="true"></span>
<span id="renderable" class="legacy-fragment" aria-hidden="true"></span>
<span id="renderableorfactory" class="legacy-fragment" aria-hidden="true"></span>
<span id="customcontent" class="legacy-fragment" aria-hidden="true"></span>
<span id="toastaction" class="legacy-fragment" aria-hidden="true"></span>

## Toast primitives

```ts
type ToastId = number | string

type ToastType =
  'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default'

type Renderable = string | number | boolean | null | undefined
type RenderableOrFactory = Renderable | (() => Renderable)
type CustomContent = HTMLElement | ((container: HTMLElement) => void)
```

`false`, `null`, and `undefined` render no text; `true` renders `"true"`. `Renderable` is text-oriented and does not include JSX or DOM nodes. Use `CustomContent` for owned DOM. The `default` and `action` types use the normal visual treatment unless your CSS differentiates them.

```ts
interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}
```

`closeOnClick` defaults to true.

<span id="toastoptions" class="legacy-fragment" aria-hidden="true"></span>
<span id="toastt" class="legacy-fragment" aria-hidden="true"></span>
<span id="toasttodismiss" class="legacy-fragment" aria-hidden="true"></span>

## Toast options and records

```ts
interface ToastOptions {
  id?: ToastId
  toasterId?: string
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  unstyled?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  action?: ToastAction
  cancel?: ToastAction
  testId?: string
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  onClick?: (event: Event) => void
}
```

See [Configuration](../configuration/) for defaults and interactions.

```ts
interface ToastT {
  id: ToastId
  toasterId?: string
  title?: RenderableOrFactory
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  unstyled?: boolean
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
  onClick?: (event: Event) => void
}

interface ToastToDismiss {
  id: ToastId
  dismiss: boolean
}
```

`ToastT` is the state and snapshot shape returned by `getToasts()` and `getHistory()`. `ToastToDismiss` is the event shape sent to low-level subscribers.

The `delete` field is a legacy record field; current dismissal tracking uses the separate dismissed-id set. Most consumers should not read it; use `toast.getToasts()`, which filters on the dismissed set, instead.

<span id="toastapi" class="legacy-fragment" aria-hidden="true"></span>

## Toast API

```ts
interface ToastApi {
  (message: RenderableOrFactory, options?: ToastOptions): ToastId
  success(message: RenderableOrFactory, options?: ToastOptions): ToastId
  error(message: RenderableOrFactory, options?: ToastOptions): ToastId
  info(message: RenderableOrFactory, options?: ToastOptions): ToastId
  warning(message: RenderableOrFactory, options?: ToastOptions): ToastId
  loading(message: RenderableOrFactory, options?: ToastOptions): ToastId
  message(message: RenderableOrFactory, options?: ToastOptions): ToastId
  custom: (content: CustomContent, options?: ToastOptions) => ToastId
  promise: <Data>(
    input: PromiseInput<Data>,
    data?: PromiseData<Data>
  ) =>
    { id: ToastId; unwrap: () => Promise<Data> } | { id?: undefined; unwrap: () => Promise<Data> }
  dismiss(id?: ToastId): ToastId | undefined
  getHistory(): ToastT[]
  getToasts(): ToastT[]
}
```

<span id="toastercontroller" class="legacy-fragment" aria-hidden="true"></span>
<span id="toasteroptions" class="legacy-fragment" aria-hidden="true"></span>
<span id="position" class="legacy-fragment" aria-hidden="true"></span>
<span id="theme" class="legacy-fragment" aria-hidden="true"></span>
<span id="direction" class="legacy-fragment" aria-hidden="true"></span>
<span id="offset" class="legacy-fragment" aria-hidden="true"></span>
<span id="swipedirection" class="legacy-fragment" aria-hidden="true"></span>

## Toaster types

```ts
type Position =
  'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

type Theme = 'light' | 'dark' | 'system'
type Direction = 'rtl' | 'ltr' | 'auto'
type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'

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
  invert?: boolean
  unstyled?: boolean
  customAriaLabel?: string
  containerAriaLabel?: string
  closeButtonAriaLabel?: string
  style?: Record<string, string>
  hotkey?: string[]
}

interface ToasterController {
  element: HTMLElement
  options: ToasterOptions
  update: (options?: ToasterOptions) => ToasterController
  destroy: () => void
}
```

`Toaster` is a runtime alias of `createToaster`. There is no separate `Toaster` type and no framework component.

<span id="promiseinput" class="legacy-fragment" aria-hidden="true"></span>
<span id="promisevalue" class="legacy-fragment" aria-hidden="true"></span>
<span id="promisedata" class="legacy-fragment" aria-hidden="true"></span>
<span id="promiseextendedresult" class="legacy-fragment" aria-hidden="true"></span>

## Promise types

```ts
type PromiseInput<Data = unknown> = Promise<Data> | (() => Promise<Data>)

interface PromiseExtendedResult extends ToastOptions {
  message: Renderable
}

type PromiseValue<Data = unknown> =
  | Renderable
  | PromiseExtendedResult
  | ((
      data: Data
    ) => Renderable | PromiseExtendedResult | Promise<Renderable | PromiseExtendedResult>)

interface PromiseData<Data = unknown> extends Omit<ToastOptions, 'description'> {
  loading?: Renderable
  success?: PromiseValue<Data>
  error?: PromiseValue
  description?: Renderable | ((data: Data | unknown) => Renderable | Promise<Renderable>)
  finally?: () => void | Promise<void>
}
```

See the [Promise API](../promises/) for the non-obvious id, description, HTTP, and `unwrap()` behavior.

<span id="toastinput" class="legacy-fragment" aria-hidden="true"></span>
<span id="toastsubscriber" class="legacy-fragment" aria-hidden="true"></span>

## Advanced state types

```ts
interface ToastInput extends Omit<ToastOptions, 'description'> {
  message?: RenderableOrFactory
  description?: RenderableOrFactory
  custom?: CustomContent
  promise?: PromiseInput<unknown>
}

type ToastSubscriber = (toast: ToastT | ToastToDismiss) => void
```

These support direct `ToastState` and `mountToaster()` integrations. They share the global state unless advanced code injects another state object. Read the [API reference](../api/) before using them.

<span id="notifyapi" class="legacy-fragment" aria-hidden="true"></span>

## Browser registry type

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

The root `browser` export, the `@samline/notify/browser` default and named exports, and `window.Notify` expose this shape. `resetToasts` and the advanced exports are not properties of `NotifyApi`.

<span id="numeric-constants" class="legacy-fragment" aria-hidden="true"></span>

## Public constants

```ts
import {
  GAP, // 14 pixels
  MOBILE_VIEWPORT_OFFSET, // '16px'
  SWIPE_THRESHOLD, // 45 pixels
  TIME_BEFORE_UNMOUNT, // 200 milliseconds
  TOAST_LIFETIME, // 4000 milliseconds
  TOAST_WIDTH, // 356 pixels
  VIEWPORT_OFFSET, // '24px'
  VISIBLE_TOASTS_AMOUNT, // 3
} from '@samline/notify'
```

`TIME_BEFORE_UNMOUNT` is the no-transition cleanup fallback. With CSS transitions active, removal waits for the longest transition and uses a computed timeout fallback instead of assuming 200 milliseconds.

## Related

- [Configuration](../configuration/)
- [API reference](../api/)
- [Browser builds](../browser/)

## Type usage notes

- ToastId is number | string. Numeric 1 and string '1' are different identities even when their data-id text is identical.
- RenderableOrFactory callbacks are evaluated when a state record is created or updated; calling the factory again with the same id evaluates the new callback again. They are not a reactive subscription.
- CustomContent mounts an owned element directly or invokes the callback with a div[data-custom] and a `{ id, dismiss }` context. The callback can run again after toaster updates; return a cleanup function to release its listeners. Use textContent for untrusted text.
- ToastAction.closeOnClick defaults to true for action and cancel. Set false only when the action should leave the toast open.
- ToasterController.element is the mounted ordered list; options is the current merged configuration. update returns the same controller. destroy clears listeners/timers and removes that container; use destroyToaster to publish global dismissals too.
- Position determines swipe availability. Direction 'auto' reads document direction. Theme 'system' resolves and follows matchMedia changes in JavaScript, rather than relying on a stylesheet-only media query.
- Offset numbers receive px; strings are forwarded. Omitted object sides use 24px desktop or 16px mobile defaults.
- SwipeDirection describes the directions derived from a position: both edges of a corner, or the vertical edge of a centered position.
- PromiseInput thunks with data run immediately; without data, each unwrap invocation runs the thunk. PromiseValue and PromiseExtendedResult let a settled message override toast options; finally waits for the rendering callback pipeline.
- NotifyApi describes the registry, not the published 3.2.0 global namespace wrapper. Resolve the registry before applying that type.
