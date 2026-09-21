---
title: CSS styling
description: Style Notify with its stylesheet, inline style option, CSS custom properties, and exact renderer attributes.
template: doc
sidebar:
  order: 7
---

Import the packaged stylesheet once in a client entrypoint:

```ts
import '@samline/notify/styles.css'
```

The IIFE does not bundle CSS; load `dist/styles.css` with a `<link>`. Without it, the renderer still creates an ordered live list, but it has no fixed layout, stack transitions, palette, or built-in button presentation.

## Three styling mechanisms

### CSS custom properties

Override design tokens in your stylesheet after the package CSS:

```css
[data-notify-toaster] {
  --border-radius: 10px;
  --normal-bg: #ffffff;
  --normal-text: #172033;
  --normal-border: #d8deea;
  --success-bg: #ecfdf3;
  --success-text: #086c3c;
  --success-border: #a6e8c4;
}
```

This is usually the best theme mechanism. The built-in light/dark rules define `--normal-*`, `--success-*`, `--info-*`, `--warning-*`, and `--error-*`. Loading, action, and default types use the normal slots. Rich colors switch typed toast backgrounds/borders/text to their corresponding slots.

### The `style` option

`ToasterOptions.style` is a JavaScript record applied to the `<ol>` as inline declarations with `element.style.setProperty()`:

```ts
createToaster({
  style: {
    '--normal-bg': '#fffdf8',
    '--border-radius': '12px',
    'font-family': 'Inter, sans-serif'
  }
})
```

It is not the same as declaring custom properties in CSS: it can contain ordinary CSS names, has inline-style cascade priority, and is applied to one mount. The renderer writes `--width`, `--gap`, and `--front-toast-height` after this map, so set width/gap through `ToasterOptions` or external CSS rather than through `style`. Updating the map does not automatically remove older inline keys that are omitted.

### Classes and `unstyled`

`ToasterOptions.className`, `ToastOptions.className`, and `descriptionClassName` attach your classes. `unstyled: true` writes `data-styled="false"`, disabling built-in toast-body presentation while retaining renderer layout and state attributes. `toast.custom()` is always unstyled.

## Container contract

The renderer appends this `<ol>` to the supplied root.

| Attribute             | Values                              | Meaning                                                                            |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `data-notify-toaster` | empty marker                        | Stylesheet scope.                                                                  |
| `data-notify-theme`   | `'light' \| 'dark'`                 | Resolved theme; `system` is converted to the current preference.                   |
| `data-y-position`     | `'top' \| 'bottom'`                 | Vertical anchor.                                                                   |
| `data-x-position`     | `'left' \| 'right' \| 'center'`     | Horizontal anchor.                                                                 |
| `data-lifted`         | `'true' \| 'false'`                 | Whether pointer expansion currently lifts the stack.                               |
| `data-rich-colors`    | `'true' \| 'false'`                 | Toaster rich-color default.                                                        |
| `dir`                 | `'ltr' \| 'rtl'`                    | Resolved direction.                                                                |
| `class`               | consumer string                     | Present when `className` is set.                                                   |
| `tabindex`            | `-1`                                | Allows programmatic focus without adding the container to normal tab order.        |
| `aria-label`          | consumer label or `'Notifications'` | Container name.                                                                    |
| `aria-live`           | `'polite'`                          | Announces non-urgent changes.                                                      |
| `aria-relevant`       | `'additions text'`                  | Announces additions and changed text, not removals.                                |
| `aria-atomic`         | `'false'`                           | Allows changed descendants rather than forcing the whole list as one announcement. |

Generated container custom properties are `--offset-top`, `--offset-right`, `--offset-bottom`, `--offset-left`, their four `--mobile-offset-*` equivalents, `--width`, `--gap`, and `--front-toast-height`. Direction rules provide icon, SVG, button, and close-button margin/position properties.

## Toast item contract

Each active state id has an `<li data-notify-toast>`.

| Attribute              | Values                                         | Meaning                                                                              |
| ---------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `data-notify-toast`    | empty marker                                   | Toast selector.                                                                      |
| `data-id`              | stringified id                                 | Public id for inspection; number and string ids can serialize identically.           |
| `data-notify-key`      | type-prefixed internal id                      | Renderer lookup key that preserves number/string distinction.                        |
| `data-type`            | `ToastType`                                    | Current variant.                                                                     |
| `data-styled`          | `'true' \| 'false'`                            | Built-in presentation gate. False for custom content or `unstyled`.                  |
| `data-rich-colors`     | `'true' \| 'false'`                            | Resolved toast/toaster setting.                                                      |
| `data-promise`         | `'true' \| 'false'`                            | Whether the state record came from `toast.promise()`.                                |
| `data-mounted`         | `'true' \| 'false'`                            | Entry-transition state.                                                              |
| `data-removed`         | `'true' \| 'false'`                            | Exit-transition state.                                                               |
| `data-visible`         | `'true' \| 'false'`                            | Whether the item is inside `visibleToasts`.                                          |
| `data-front`           | `'true' \| 'false'`                            | Newest/front item.                                                                   |
| `data-expanded`        | `'true' \| 'false'`                            | Expanded-stack state.                                                                |
| `data-y-position`      | `'top' \| 'bottom'`                            | Resolved item position.                                                              |
| `data-x-position`      | `'left' \| 'right' \| 'center'`                | Resolved item position.                                                              |
| `data-index`           | integer string                                 | Newest-first stack index.                                                            |
| `data-swiping`         | `'true' \| 'false'`                            | Active pointer swipe.                                                                |
| `data-swiped`          | `'true' \| 'false'` when set                   | Whether pointer movement produced a swipe.                                           |
| `data-swipe-out`       | `'true' \| 'false'`                            | Swipe-dismiss animation gate.                                                        |
| `data-swipe-direction` | `'left' \| 'right' \| 'up' \| 'down'` when set | Dismissal animation direction.                                                       |
| `data-dismissible`     | `'true' \| 'false'`                            | User-dismiss interaction gate.                                                       |
| `data-invert`          | `'true' \| 'false'`                            | Resolved inversion.                                                                  |
| `data-testid`          | consumer string                                | Optional test selector.                                                              |
| `data-snapshot`        | internal serialized value                      | Renderer change-detection cache; do not depend on its format.                        |
| `data-duration`        | number or `'Infinity'` string                  | Renderer timer cache.                                                                |
| `tabindex`             | `0`                                            | Makes the toast focusable for reading, pausing, keyboard activation, and dismissal.  |
| `aria-busy`            | `'true' \| 'false'`                            | True for loading type.                                                               |
| `aria-label`           | variant prefix plus title, except normal       | Exposes typed state such as `success: Saved`; normal toasts rely on descendant text. |

Renderer-owned item properties include `--index`, `--toasts-before`, `--z-index`, `--initial-height`, `--offset`, `--swipe-amount-x`, and `--swipe-amount-y`. Avoid overriding them.

## Inner elements

| Selector                                       | Element and condition                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `[data-close-button]`                          | Native button when close is requested and content is neither loading nor custom. It also receives `data-disabled` and an `aria-label`. |
| `[data-icon]`                                  | Icon wrapper for typed icons, the loading spinner, or custom content. Generated decorative icons are `aria-hidden`.                    |
| `.notify-loading-wrapper[data-visible="true"]` | Loading spinner wrapper. The packaged renderer creates it as visible; the stylesheet also supports a false exit state.                 |
| `[data-custom]`                                | Custom callback/element mount point.                                                                                                   |
| `[data-content]`                               | Title and description wrapper.                                                                                                         |
| `[data-title]`                                 | Primary text.                                                                                                                          |
| `[data-description]`                           | Optional secondary text.                                                                                                               |
| `[data-button][data-cancel]`                   | Native cancel button.                                                                                                                  |
| `[data-button][data-action]`                   | Native action button.                                                                                                                  |

The loading markup also uses `.notify-loading-wrapper`, `.notify-spinner`, `.notify-loading-bar`, and `.notify-loader`. These are the only built-in class selectors; consumer toast/container classes are optional.

## Responsive and motion behavior

At `max-width: 600px`, the stylesheet makes the toaster full-width within `--mobile-offset-*`. At `prefers-reduced-motion`, it removes Notify transitions and animations, including spinner animation. JavaScript auto-dismiss timing is unchanged, and DOM cleanup uses its fallback delay.

Use `duration: Infinity` or longer durations when content needs extra reading/interaction time; reduced motion does not imply extended timing. See [Accessibility](/notify/reference/accessibility/).
