---
title: Configuration
description: Every ToasterOptions and ToastOptions field, with exact defaults and behavior.
template: doc
sidebar:
  order: 2
---

`createToaster(options?)`, `configureToaster(options?)`, and `controller.update(options?)` accept `ToasterOptions`. The callable `toast` and its variants accept `ToastOptions`.

## Toaster options

| Option                 | Type                            | Default                                      | Behavior                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | `string`                        | `undefined`                                  | Legacy filter paired with a toast's `toasterId`. It filters the shared global state; it does not create an independent channel. Prefer one singleton mount.                                                                                                                                                       |
| `theme`                | `'light' \| 'dark' \| 'system'` | `'light'`                                    | Sets `data-notify-theme`. `system` resolves to light or dark with `prefers-color-scheme` and follows changes.                                                                                                                                                                                                     |
| `position`             | `Position`                      | `'bottom-right'`                             | Sets the viewport anchor. The four corner positions support swipe; centered positions do not.                                                                                                                                                                                                                     |
| `expand`               | `boolean`                       | `false`                                      | Keeps all stacked toasts expanded instead of expanding only during pointer interaction.                                                                                                                                                                                                                           |
| `duration`             | `number`                        | `undefined`                                  | Default per-toast duration. Resolution falls back to `TOAST_LIFETIME` (`4000` ms); `Infinity` disables automatic dismissal.                                                                                                                                                                                       |
| `gap`                  | `number`                        | `GAP` (`14`)                                 | Stack gap in pixels. Written to `--gap`.                                                                                                                                                                                                                                                                          |
| `visibleToasts`        | `number`                        | `VISIBLE_TOASTS_AMOUNT` (`3`)                | Number of interactive, visible stack items. Other active items remain rendered with `data-visible="false"`.                                                                                                                                                                                                       |
| `closeButton`          | `boolean`                       | `false`                                      | Default close-button request. Loading and custom toasts never render one. A non-dismissible toast may render an inert close button, so do not combine `closeButton: true` with `dismissible: false`.                                                                                                              |
| `className`            | `string`                        | `undefined`                                  | Class string on the toaster `<ol>`.                                                                                                                                                                                                                                                                               |
| `offset`               | `Offset`                        | `VIEWPORT_OFFSET` (`'24px'`) per side        | Desktop viewport offsets. Missing object sides use the default.                                                                                                                                                                                                                                                   |
| `mobileOffset`         | `Offset`                        | `MOBILE_VIEWPORT_OFFSET` (`'16px'`) per side | Offsets used by the stylesheet below 600px. Missing object sides use the default.                                                                                                                                                                                                                                 |
| `dir`                  | `'ltr' \| 'rtl' \| 'auto'`      | detected document direction                  | `auto` resolves from the root `dir` attribute or computed direction; the rendered attribute is `ltr` or `rtl`.                                                                                                                                                                                                    |
| `richColors`           | `boolean`                       | `false`                                      | Default rich palette for typed toasts. A toast can override it.                                                                                                                                                                                                                                                   |
| `invert`               | `boolean`                       | `false`                                      | Inverts the normal palette. A true toaster value also applies when a toast passes `invert: false`; toast and toaster values are combined with logical OR.                                                                                                                                                         |
| `unstyled`             | `boolean`                       | `false`                                      | Sets `data-styled="false"` for all toasts. Custom toasts are always unstyled. A toast cannot opt back into built-in styles under an unstyled toaster.                                                                                                                                                             |
| `customAriaLabel`      | `string`                        | `undefined`                                  | Preferred `aria-label` for the toaster container. Despite its historical name, it does not label each toast.                                                                                                                                                                                                      |
| `containerAriaLabel`   | `string`                        | `'Notifications'`                            | Toaster `aria-label`, used when `customAriaLabel` is absent.                                                                                                                                                                                                                                                      |
| `closeButtonAriaLabel` | `string`                        | `'Close toast'`                              | Accessible name for every generated close button. Localize this for the page language.                                                                                                                                                                                                                            |
| `style`                | `Record<string, string>`        | `undefined`                                  | Declarations applied directly to the toaster's inline `style`. Use CSS property names such as `background` or custom-property names such as `--normal-bg`; this is not a stylesheet object. Generated `--width`, `--gap`, and `--front-toast-height` are written afterward and cannot be set through this option. |
| `hotkey`               | `string[]`                      | `['altKey', 'KeyT']`                         | Keys that must all match. Modifiers accept `altKey`, `ctrlKey`, `metaKey`, or `shiftKey` (and short aliases); other entries match `KeyboardEvent.code`. `[]` disables it. Events from inputs, textareas, selects, and editable elements are ignored.                                                              |

`controller.update()` shallow-merges options. Omitted fields keep their current values. Inline declarations previously written by `style` are not removed merely because a later style map omits them.

### Offset values

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

Numbers become pixels. Strings such as `'2rem'` or `'env(safe-area-inset-bottom)'` are used verbatim.

## Toast options

| Option                 | Type                      | Default                           | Behavior                                                                                                                                                                                                                   |
| ---------------------- | ------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | `number \| string`        | generated counter starting at `1` | Reusing an existing id updates that toast. Empty strings are not accepted as explicit ids and receive a generated number. Number `1` and string `'1'` remain distinct in state.                                            |
| `toasterId`            | `string`                  | `undefined`                       | Legacy filter matched by a mount's `id`. All mounts still share `ToastState`, history, counter, and events; this is not isolation or a recommended routing mechanism.                                                      |
| `description`          | `RenderableOrFactory`     | `undefined`                       | Secondary text. A function is evaluated during creation; stored values are rendered with `textContent`.                                                                                                                    |
| `type`                 | `ToastType`               | `'normal'`                        | Controls icon and styling. Loading suppresses its timer and interactions.                                                                                                                                                  |
| `richColors`           | `boolean`                 | toaster value                     | Per-toast rich palette override.                                                                                                                                                                                           |
| `invert`               | `boolean`                 | `false`                           | Inverts the normal palette for this toast. A true toaster value always wins.                                                                                                                                               |
| `unstyled`             | `boolean`                 | `false`                           | Removes built-in toast presentation by setting `data-styled="false"`. Custom content is always unstyled.                                                                                                                   |
| `closeButton`          | `boolean`                 | toaster value                     | Requests a close button, except on loading or custom content.                                                                                                                                                              |
| `dismissible`          | `boolean`                 | `true`                            | Controls swipe, Delete/Backspace dismissal, and whether a generated close button acts. It does not prevent programmatic dismissal or auto-close.                                                                           |
| `duration`             | `number`                  | toaster duration, then `4000`     | Milliseconds before auto-close. `Infinity` disables the timer. Loading types never start one.                                                                                                                              |
| `className`            | `string`                  | `undefined`                       | Class string on the toast `<li>`.                                                                                                                                                                                          |
| `descriptionClassName` | `string`                  | `undefined`                       | Class string on the description element.                                                                                                                                                                                   |
| `action`               | `ToastAction`             | `undefined`                       | Native trailing button. `closeOnClick` defaults to true.                                                                                                                                                                   |
| `cancel`               | `ToastAction`             | `undefined`                       | Native button rendered before `action`. `closeOnClick` defaults to true.                                                                                                                                                   |
| `testId`               | `string`                  | `undefined`                       | Writes `data-testid` on the toast.                                                                                                                                                                                         |
| `onDismiss`            | `(toast: ToastT) => void` | `undefined`                       | Runs once when the subscribed renderer receives dismissal by timer, close button, swipe, keyboard, `toast.dismiss()`, or `destroyToaster()`. With duplicate mounts, each renderer can invoke it for the same global event. |
| `onAutoClose`          | `(toast: ToastT) => void` | `undefined`                       | Runs only when that renderer's auto-dismiss timer expires, immediately before dismissal.                                                                                                                                   |
| `onClick`              | `(event: Event) => void`  | `undefined`                       | Runs for toast-body click or Enter/Space while the `<li>` itself is focused. Button clicks and loading toasts are excluded. It does not dismiss automatically.                                                             |

### Actions

```ts
interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean // default true
}
```

Use a concise action label that identifies the result, such as `Undo deletion` rather than `Click here`. Both action kinds are real `<button type="button">` elements.

## Inheritance example

```ts
import { createToaster, toast } from '@samline/notify'

createToaster({
  duration: 6000,
  richColors: true,
  closeButton: true,
  closeButtonAriaLabel: 'Dismiss notification',
  hotkey: ['metaKey', 'KeyK']
})

toast.info('Deployment started', {
  duration: Infinity,
  unstyled: false,
  onClick: () => location.assign('/deployments')
})
```

See [Accessibility](/notify/reference/accessibility/) before choosing short durations or persistent loading states.
