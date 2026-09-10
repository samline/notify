# CSS styling

The runtime ships a single stylesheet (`@samline/notify/styles.css`) that the renderer expects. The stylesheet does not target any class names — it targets the `data-*` attributes the vanilla renderer writes on every element. Theme by overriding CSS variables; layout by overriding other variables; the rest follows.

This page documents the full data-attribute contract and shows how to layer your own theming on top.

---

## Importing the stylesheet

```ts
import '@samline/notify/styles.css'
```

You only need to import it once. Importing it multiple times is harmless (the rules cascade over each other in source order). If you are using the IIFE bundle, copy the file from `dist/styles.css` to your own static asset and add a `<link rel="stylesheet" href="…">` instead.

The stylesheet expects the host page to use the CSS `--gap` math. The runtime sets a handful of CSS custom properties on the `<ol data-notify-toaster>` element — your stylesheet only needs to read them.

---

## Toaster container

One `<ol data-notify-toaster>` is appended to `document.body` when [`createToaster()`](api/create-toaster.md) is called.

### Data-attributes

| Attribute             | Values                          | Written from                                                                          | Description                                                                                                   |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `data-notify-toaster` | `''`                            | always                                                                                | Marker — the stylesheet scopes every rule below this element.                                                 |
| `data-notify-theme`   | `'light' \| 'dark' \| 'system'` | [`ToasterOptions.theme`](options.md#toasteroptions)                                   | Theme the stylesheet should use. `'system'` resolves via `prefers-color-scheme`.                              |
| `data-x-position`     | `'left' \| 'right' \| 'center'` | derived from `position`                                                               | Horizontal anchor.                                                                                            |
| `data-y-position`     | `'top' \| 'bottom'`             | derived from `position`                                                               | Vertical anchor.                                                                                              |
| `data-lifted`         | `'true'`                        | always (when motion is allowed)                                                       | The container lifts on `hover: none + pointer: coarse` devices. The stylesheet flips it to suppress the lift. |
| `data-rich-colors`    | `'true' \| 'false'`             | [`ToasterOptions.richColors`](options.md#toasteroptions)                              | When `true`, the per-type color slots use the rich background.                                                |
| `dir`                 | `'ltr' \| 'rtl' \| 'auto'`      | [`ToasterOptions.dir`](options.md#toasteroptions)                                     | Text direction.                                                                                               |
| `tabIndex`            | `-1`                            | always                                                                                | Container is focusable programmatically (not via tab) so screen readers can reach the list.                   |
| `aria-label`          | `string`                        | [`ToasterOptions.containerAriaLabel`](options.md#toasteroptions) or `customAriaLabel` | Region label for assistive tech.                                                                              |
| `class`               | `string`                        | [`ToasterOptions.className`](options.md#toasteroptions)                               | Optional extra class names.                                                                                   |

### CSS custom properties

| Property                                                    | Default                           | Description                                                           |
| ----------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `--offset-top`                                              | `VIEWPORT_OFFSET` (`24px`)        | Distance from the top edge.                                           |
| `--offset-right`                                            | `VIEWPORT_OFFSET` (`24px`)        | Distance from the right edge.                                         |
| `--offset-bottom`                                           | `VIEWPORT_OFFSET` (`24px`)        | Distance from the bottom edge.                                        |
| `--offset-left`                                             | `VIEWPORT_OFFSET` (`24px`)        | Distance from the left edge.                                          |
| `--mobile-offset-top`                                       | `MOBILE_VIEWPORT_OFFSET` (`16px`) | Distance from the top edge on coarse pointers.                        |
| `--mobile-offset-right`                                     | `MOBILE_VIEWPORT_OFFSET` (`16px`) | Distance from the right edge on coarse pointers.                      |
| `--mobile-offset-bottom`                                    | `MOBILE_VIEWPORT_OFFSET` (`16px`) | Distance from the bottom edge on coarse pointers.                     |
| `--mobile-offset-left`                                      | `MOBILE_VIEWPORT_OFFSET` (`16px`) | Distance from the left edge on coarse pointers.                       |
| `--width`                                                   | `TOAST_WIDTH` (`356`)             | Width of each toast.                                                  |
| `--gap`                                                     | `GAP` (`14`)                      | Vertical gap between stacked toasts (in `px`).                        |
| `--front-toast-height`                                      | `0px`                             | Height of the front-most toast; the renderer updates it after layout. |
| `--toast-icon-margin-start` / `--toast-icon-margin-end`     | derived from `dir`                | Margin around the icon (`ltr` vs `rtl` aware).                        |
| `--toast-svg-margin-start` / `--toast-svg-margin-end`       | derived from `dir`                | Margin around the SVG inside the icon.                                |
| `--toast-button-margin-start` / `--toast-button-margin-end` | derived from `dir`                | Margin around the action/cancel button.                               |
| `--toast-close-button-start` / `--toast-close-button-end`   | derived from `dir`                | Anchor of the close button.                                           |
| `--toast-close-button-transform`                            | derived from `dir`                | Translate of the close button.                                        |

You can override any of these on a per-page or per-mount basis:

```css
[data-notify-toaster] {
  --offset-bottom: 32px;
  --gap: 16px;
  --width: 380px;
}
```

---

## Toast item

One `<li data-notify-toast>` per active toast id.

### Data-attributes

| Attribute              | Values                                | Written from                                   | Description                                                                                                          |
| ---------------------- | ------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `data-notify-toast`    | `''`                                  | always                                         | Marker.                                                                                                              |
| `data-id`              | `string`                              | `ToastOptions.id` (stringified)                | The toast id, stringified for the attribute selector.                                                                |
| `data-type`            | `ToastType`                           | [`ToastOptions.type`](options.md#toastoptions) | Variant — `'normal' \| 'action' \| 'success' \| 'info' \| 'warning' \| 'error' \| 'loading' \| 'default'`.           |
| `data-styled`          | `'true'`                              | always                                         | Gate for the built-in visual treatment. The stylesheet only applies the bg/border/color rules when this is `'true'`. |
| `data-rich-colors`     | `'true' \| 'false'`                   | per-toast override or toaster default          | Whether this toast uses the rich color treatment.                                                                    |
| `data-mounted`         | `'true' \| 'false'`                   | always (after mount)                           | Animation gate — the stylesheet flips `--y` to `translateY(0)` and `opacity` to `1` when this is `true`.             |
| `data-removed`         | `'true' \| 'false'`                   | set to `'true'` on dismiss                     | The exit transition uses this attribute.                                                                             |
| `data-visible`         | `'true' \| 'false'`                   | per index vs `visibleToasts`                   | `'false'` makes the toast invisible (`opacity: 0`, `pointer-events: none`).                                          |
| `data-front`           | `'true' \| 'false'`                   | `index === 0`                                  | Whether this toast is the front-most of the stack.                                                                   |
| `data-expanded`        | `'true' \| 'false'`                   | on hover / focus / `expand: true`              | Whether the stack is expanded.                                                                                       |
| `data-y-position`      | `'top' \| 'bottom'`                   | derived from `position`                        | Vertical anchor of this toast (matches the toaster).                                                                 |
| `data-x-position`      | `'left' \| 'right' \| 'center'`       | derived from `position`                        | Horizontal anchor.                                                                                                   |
| `data-index`           | `string`                              | `index`                                        | Position in the visible stack.                                                                                       |
| `data-swiping`         | `'true' \| 'false'`                   | during swipe                                   | Touch-swipe is in progress. The stylesheet suppresses the transition.                                                |
| `data-swiped`          | `'true' \| 'false'`                   | after a real swipe                             | Disables text selection during swipe.                                                                                |
| `data-swipe-out`       | `'true' \| 'false'`                   | set on swipe-dismiss                           | Triggers the `swipe-out-*` keyframe animation.                                                                       |
| `data-swipe-direction` | `'left' \| 'right' \| 'up' \| 'down'` | swipe axis                                     | Which keyframe the stylesheet plays.                                                                                 |
| `data-dismissible`     | `'true' \| 'false'`                   | `ToastOptions.dismissible`                     | Whether the close button is shown.                                                                                   |
| `data-invert`          | `'true' \| 'false'`                   | `ToastOptions.invert`                          | Whether to flip fg/bg.                                                                                               |
| `data-promise`         | `'true' \| 'false'`                   | `toast.promise` (internal)                     | Whether the toast is a `toast.promise` toast.                                                                        |
| `data-disabled`        | `'true' \| 'false'`                   | type is `'loading'`                            | Whether the toast is in a non-interactive state.                                                                     |
| `data-testid`          | `string`                              | `ToastOptions.testId`                          | E2E test hook.                                                                                                       |
| `tabIndex`             | `0`                                   | always                                         | Toast is focusable so it can receive `focusin` / `focusout` to pause the auto-dismiss timer.                         |

### CSS custom properties

| Property                                | Default                                                 | Description                                                                                                                    |
| --------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--y`                                   | `translateY(100%)` (or `translateY(-100%)` for `top-*`) | The translate transform applied by the stack layout. The stylesheet overrides this when `data-mounted` or `data-removed` flip. |
| `--lift`                                | `1` (top) / `-1` (bottom)                               | Sign of the y-axis lift.                                                                                                       |
| `--lift-amount`                         | `calc(var(--lift) * var(--gap))`                        | Distance to lift each stacked toast.                                                                                           |
| `--scale`                               | `var(--toasts-before) * 0.05 + 1`                       | Per-toast scale, only applied to non-front stacked toasts.                                                                     |
| `--index`                               | `0`                                                     | The toast's position in the visible stack.                                                                                     |
| `--toasts-before`                       | `0`                                                     | How many toasts are in front of this one.                                                                                      |
| `--z-index`                             | `1000 - index`                                          | Stack order.                                                                                                                   |
| `--initial-height`                      | `auto`                                                  | The height captured at mount.                                                                                                  |
| `--offset`                              | `0`                                                     | The runtime offset for stacked toasts (sum of front heights).                                                                  |
| `--swipe-amount-x` / `--swipe-amount-y` | `0px`                                                   | Live translation during a swipe gesture.                                                                                       |

### Inner elements

The renderer mounts these inner elements in order:

| Element                                        | Data-attribute      | When                                                                                               |
| ---------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------- |
| `<button data-close-button data-disabled="…">` | `data-close-button` | When `closeButton` is true and the toast is not a `loading` toast.                                 |
| `<div data-icon>…</div>`                       | `data-icon`         | Always (for the icon slot). Holds the SVG icon, the loader markup, or a `[data-custom]` container. |
| `<div data-content>`                           | `data-content`      | Wrapper for the title + description.                                                               |
| `<div data-title>`                             | `data-title`        | The primary text node.                                                                             |
| `<div data-description>`                       | `data-description`  | When `ToastOptions.description` is set.                                                            |
| `<button data-button data-cancel>`             | `data-cancel`       | When `ToastOptions.cancel` is set.                                                                 |
| `<button data-button data-action>`             | `data-action`       | When `ToastOptions.action` is set.                                                                 |

---

## Theme variables

The stylesheet reads these per-theme color variables off the toaster and the toast itself. Override them on the matching selector to retheme the runtime.

### Per-type color slots

Every toast has four color slots that the stylesheet reads. They are the only colors you need to override to retheme the runtime:

| Variable                                             | Used by                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `--normal-bg`, `--normal-text`, `--normal-border`    | `type: 'normal'`, `'action'`, `'default'`     |
| `--success-bg`, `--success-text`, `--success-border` | `type: 'success'`                             |
| `--info-bg`, `--info-text`, `--info-border`          | `type: 'info'`                                |
| `--warning-bg`, `--warning-text`, `--warning-border` | `type: 'warning'`                             |
| `--error-bg`, `--error-text`, `--error-border`       | `type: 'error'`                               |
| `--loading-bg`, `--loading-text`, `--loading-border` | `type: 'loading'` (defaults to `--normal-bg`) |

When `data-rich-colors="true"` the background is the rich color, the border is the rich color, and the text is the contrasting slot. Otherwise the background is a soft tint and the text is `--gray12`.

### Grayscale ramp

The stylesheet also uses a 12-step grayscale ramp on the toaster:

| Variable   | Default             | Purpose           |
| ---------- | ------------------- | ----------------- |
| `--gray1`  | `hsl(0, 0%, 99%)`   | Page white.       |
| `--gray2`  | `hsl(0, 0%, 97.3%)` | Hover background. |
| `--gray3`  | `hsl(0, 0%, 95.1%)` | —                 |
| `--gray4`  | `hsl(0, 0%, 93%)`   | —                 |
| `--gray5`  | `hsl(0, 0%, 90.9%)` | Hover border.     |
| `--gray6`  | `hsl(0, 0%, 88.7%)` | —                 |
| `--gray7`  | `hsl(0, 0%, 85.8%)` | —                 |
| `--gray8`  | `hsl(0, 0%, 78%)`   | —                 |
| `--gray9`  | `hsl(0, 0%, 56.1%)` | Disabled fg.      |
| `--gray10` | `hsl(0, 0%, 52.3%)` | —                 |
| `--gray11` | `hsl(0, 0%, 43.5%)` | Muted text.       |
| `--gray12` | `hsl(0, 0%, 9%)`    | Primary text.     |

Override these on `[data-notify-toaster]` to retheme the entire runtime.

### Border radius

```css
[data-notify-toaster] {
  --border-radius: 8px;
}
```

The toast itself inherits `--border-radius` from the toaster, so a single override retheme every toast.

---

## Recipes

### Brand-aligned success color

```css
[data-notify-toaster] {
  --success-bg: oklch(0.96 0.04 150);
  --success-text: oklch(0.22 0.1 150);
  --success-border: oklch(0.78 0.1 150);
}
```

### Tighter stack, wider toasts

```css
[data-notify-toaster] {
  --gap: 10px;
  --width: 420px;
  --offset-bottom: 24px;
}
```

### Border-only (no background)

```css
[data-notify-toast][data-styled='true'] {
  background: transparent;
  box-shadow: none;
}
```

### Loading spinner color

```css
[data-notify-toast][data-type='loading'] [data-icon] .notify-loading-bar {
  background: var(--loading-text);
}
```

### Mobile offset tweak

```css
[data-notify-toaster] {
  --mobile-offset-bottom: 24px;
}
```

---

## Accessibility

The runtime does not announce anything to assistive tech. It applies `role="region"` (implicit via the `<ol>` with `aria-label`) on the container and `aria-label="Close toast"` on each close button. If you need richer screen-reader feedback (e.g. a live region that announces every new toast), add your own `<div aria-live="polite">` next to the toaster and append a hidden copy of every new title to it.

`prefers-reduced-motion` is honored — the stylesheet suppresses the entry/exit transitions, the swipe-out keyframes, and the lift effect. The runtime still schedules the dismiss timer at the same pace; only the visual animation is skipped.

---

## Common pitfalls

- **Do not write your own CSS that targets class names.** The renderer does not set any class names. Target the `data-*` attributes instead, or override the CSS variables.
- **The data-attributes are the source of truth, not the rendered text.** Re-theming a single toast should go through `ToastOptions.className` + your own `data-` selector — do not reach into the `<li>` and edit `textContent`.
- **`data-rich-colors` cascades.** A toast that sets `richColors: true` only opts in that toast. The toaster default (`ToasterOptions.richColors`) opts in every toast that does not override it.
- **Swipe-to-dismiss is disabled for centered positions.** There is no data-attribute you can set to re-enable it — it is a renderer-level decision driven by `position`.
- **`prefers-reduced-motion` is honored only by the stylesheet.** The runtime still schedules the auto-dismiss timer at the normal pace.
