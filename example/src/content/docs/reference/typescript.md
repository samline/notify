---
title: TypeScript reference
description: Every public type and constant exported by @samline/notify.
template: doc
sidebar:
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
  ToasterOptions
} from '@samline/notify'
```

## Toast primitives

```ts
type ToastId = number | string

type ToastType =
  'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default'

type Renderable = string | number | boolean | null | undefined
type RenderableOrFactory = Renderable | (() => Renderable)
type CustomContent = HTMLElement | ((container: HTMLElement) => void)
```

`false`, `null`, and `undefined` render no text; `true` renders `"true"`. `Renderable` is text-oriented and does not include JSX or DOM nodes. Use `CustomContent` for owned DOM. `'default'` and `'action'` use the normal visual treatment unless your CSS differentiates them.

```ts
interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}
```

`closeOnClick` defaults to true.

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

See [Configuration](/notify/reference/configuration/#toast-options) for defaults and interactions.

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

`ToastT` is the state/snapshot shape returned by `getToasts()` and `getHistory()`. `ToastToDismiss` is the event shape sent to low-level subscribers.

## Toast API

```ts
interface ToastApi {
  (message: Renderable, options?: ToastOptions): ToastId
  success(message: Renderable, options?: ToastOptions): ToastId
  error(message: Renderable, options?: ToastOptions): ToastId
  info(message: Renderable, options?: ToastOptions): ToastId
  warning(message: Renderable, options?: ToastOptions): ToastId
  loading(message: Renderable, options?: ToastOptions): ToastId
  message(message: Renderable, options?: ToastOptions): ToastId
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
  update(options?: ToasterOptions): ToasterController
  destroy(): void
}
```

`Toaster` is a runtime alias of `createToaster`; there is no separate `Toaster` type or framework component.

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

See the [Promise API](/notify/reference/promises/) for the non-obvious id, description, HTTP, and `unwrap()` behavior.

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

These support direct `ToastState` and `mountToaster()` integrations. They share global state unless advanced code injects another state object. Read [Advanced exports](/notify/reference/api/#advanced-exports) before using them.

## Browser registry type

```ts
interface NotifyApi {
  toast: typeof toast
  Toaster(options?: ToasterOptions): ToasterController
  createToaster(options?: ToasterOptions): ToasterController
  configureToaster(options?: ToasterOptions): ToasterController
  getToaster(): ToasterController | null
  destroyToaster(): void
}
```

The root `browser` export, the `@samline/notify/browser` default/named export, and `window.Notify` expose this shape. `resetToasts` and advanced exports are not properties of `NotifyApi`.

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
  VISIBLE_TOASTS_AMOUNT // 3
} from '@samline/notify'
```

`TIME_BEFORE_UNMOUNT` is the no-transition/reduced-motion cleanup fallback. With CSS transitions active, removal waits for the longest transition and uses a computed timeout fallback instead of assuming 200 ms.
