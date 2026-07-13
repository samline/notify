# Options

`@samline/notify` exposes two option shapes: `ToasterOptions` (controls the singleton controller) and `ToastOptions` (controls a single toast). Every field has a default — pass only what you need.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({
  position: 'bottom-right',
  theme: 'system',
  richColors: true,
  duration: 4000,
  visibleToasts: 3,
  offset: 24,
  mobileOffset: 16
})

toast('Saved', {
  type: 'success',
  description: 'Your profile is up to date.',
  duration: 5000,
  action: { label: 'View', onClick: () => location.assign('/profile') }
})
```

---

## `ToasterOptions`

The argument to [`createToaster()`](api/create-toaster.md), [`configureToaster()`](api/configure-toaster.md), and `toaster.update()`.

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

### Field reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `undefined` | Optional toaster id. Used to filter which toasts a given toaster renders — pass `toasterId` on a [`ToastOptions`](api/toast.md) to target a specific toaster. |
| `theme` | `'light' \| 'dark' \| 'system'` | `'light'` | Theme the stylesheet should use. `'system'` follows `prefers-color-scheme` via the CSS media query. |
| `position` | [`Position`](#position)` \| 'top-center' \| 'bottom-center'` | `'bottom-right'` | Where the container is fixed on the viewport. |
| `expand` | `boolean` | `false` | When `true`, hovering the toaster always expands the stacked previews (no need to move the mouse to reveal them). |
| `duration` | `number` | `4000` | Default auto-dismiss in ms. Per-toast `duration` overrides it. `Infinity` disables the auto-dismiss. |
| `gap` | `number` | `14` | Pixel gap between stacked toasts. Applied via `--gap` on the container. |
| `visibleToasts` | `number` | `3` | How many stacked toasts are visible at once. The rest are still rendered but the stylesheet hides them under `--offset`. |
| `closeButton` | `boolean` | `false` | When `true`, each toast renders a close button (skipped for `loading` and `custom`). |
| `className` | `string` | `undefined` | Extra class names appended to the `<ol data-notify-toaster>`. |
| `offset` | [`Offset`](#offset) | `'24px'` | Distance from the viewport edges. |
| `mobileOffset` | [`Offset`](#offset) | `'16px'` | Distance from the viewport edges on coarse pointers (`@media (hover: none) and (pointer: coarse)`). |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` (resolved from `document.dir` / `getComputedStyle`) | Text direction of the container. |
| `richColors` | `boolean` | `false` | When `true`, the stylesheet applies the colored backgrounds/borders to `success`, `error`, `warning`, and `info` types. |
| `customAriaLabel` | `string` | `undefined` | When set, overrides the `aria-label` on every toast. |
| `containerAriaLabel` | `string` | `'Notifications'` | `aria-label` on the `<ol>` container. |

### `Position`

```ts
type Position =
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'top-center' | 'bottom-center'
```

Swipe-to-dismiss is only enabled for the four corner positions. Centered positions are not swipeable.

### `Offset`

```ts
type Offset =
  | number            // 24 → "24px" on all four sides
  | string            // "2rem" → "2rem" on all four sides
  | {
      top?: number | string
      right?: number | string
      bottom?: number | string
      left?: number | string
    }
```

Numeric values get a `px` suffix; strings are forwarded verbatim. Each side falls back to `VIEWPORT_OFFSET` (24px desktop) or `MOBILE_VIEWPORT_OFFSET` (16px mobile) when omitted.

### `Theme`

```ts
type Theme = 'light' | 'dark' | 'system'
```

`'system'` resolves via `prefers-color-scheme` in the stylesheet (no JS color-scheme detection is performed — the CSS media query does the work).

### `Direction`

```ts
type Direction = 'rtl' | 'ltr' | 'auto'
```

`'auto'` reads `document.documentElement.getAttribute('dir')` and falls back to the computed CSS direction.

---

## `ToastOptions`

The argument to [`toast()`](api/toast.md) and every variant (`toast.success`, `toast.error`, …).

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

### Field reference

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `ToastId` (`number \| string`) | auto-incremented | Stable id. Re-using an id updates the existing toast in place. |
| `toasterId` | `string` | `undefined` | Routes this toast to a toaster created with a matching [`id`](#id) on `ToasterOptions`. |
| `description` | [`RenderableOrFactory`](#renderable) | `undefined` | Secondary line under the title. A function is invoked once on creation. |
| `type` | [`ToastType`](#toasttype) | `'normal'` | Visual + semantic variant. `loading` is the only variant that suppresses auto-dismiss. |
| `richColors` | `boolean` | inherited from toaster | Force the rich-color treatment on this toast only. |
| `invert` | `boolean` | `false` | When `true`, swaps foreground/background for a darker-on-lighter look. |
| `closeButton` | `boolean` | inherited from toaster | Force a close button on this toast. |
| `dismissible` | `boolean` | `true` | When `false`, the close button is hidden and swipe-to-dismiss is disabled. Loading toasts are never dismissible. |
| `duration` | `number` | inherited from toaster | Auto-dismiss in ms. `Infinity` disables it for this toast. |
| `className` | `string` | `undefined` | Extra class names appended to the `<li>`. |
| `descriptionClassName` | `string` | `undefined` | Extra class names appended to the `[data-description]` element. |
| `action` | [`ToastAction`](#toastaction) | `undefined` | Trailing button. Default closes the toast on click. |
| `cancel` | [`ToastAction`](#toastaction) | `undefined` | Leading button (rendered before `action`). Default closes the toast on click. |
| `testId` | `string` | `undefined` | Rendered as `data-testid` on the `<li>` for E2E tests. |

### `Renderable`

```ts
type Renderable = string | number | boolean | null | undefined
```

Anything safely renderable as text. Booleans render as `'true'` or `''`; `null` and `undefined` render as nothing.

### `RenderableOrFactory`

```ts
type RenderableOrFactory = Renderable | (() => Renderable)
```

A function is invoked once on creation. Useful for lazy titles / descriptions that depend on current locale or runtime state.

### `ToastType`

```ts
type ToastType =
  | 'normal' | 'action' | 'success' | 'info'
  | 'warning' | 'error' | 'loading' | 'default'
```

`'default'` is the legacy alias for `'normal'`. The renderer maps them to the same `<li data-type="...">` and the same icon slot (none).

### `ToastAction`

```ts
interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}
```

`closeOnClick` defaults to `true` for both `action` and `cancel`. Set it to `false` to keep the toast open after a click (e.g. for a copy-to-clipboard confirmation).

---

## Defaults at a glance

```ts
const DEFAULT_TOASTER = {
  theme: 'light',
  position: 'bottom-right',
  expand: false,
  duration: 4000,           // TOAST_LIFETIME
  gap: 14,                  // GAP
  visibleToasts: 3,         // VISIBLE_TOASTS_AMOUNT
  closeButton: false,
  dir: 'auto',
  richColors: false,
  containerAriaLabel: 'Notifications',
  offset: '24px',           // VIEWPORT_OFFSET
  mobileOffset: '16px'      // MOBILE_VIEWPORT_OFFSET
}

const DEFAULT_TOAST = {
  type: 'normal',
  dismissible: true,
  duration: undefined       // inherits toaster
}
```

The numeric defaults are also re-exported as constants from the package root — see [`docs/typescript.md`](typescript.md#numeric-constants) for the full list.
