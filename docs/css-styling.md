# CSS styling

Import the packaged stylesheet once in a client entrypoint:

```ts
import '@samline/notify/styles.css'
```

The standalone build does not bundle CSS. Load `dist/styles.css` with a `link` element instead. Without it, the renderer still creates an ordered live list, but it has no fixed layout, no stack transitions, no palette, and no built-in button presentation.

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

This is usually the best theme mechanism. The built-in light and dark rules define the `normal`, `success`, `info`, `warning`, and `error` slots. Loading, action, and default types use the normal slots. Rich colors switch the typed toast backgrounds, borders, and text to their corresponding slots.

The stylesheet also uses a 12-step grayscale ramp, from `--gray1` to `--gray12`, on the container. Override those on `[data-notify-toaster]` to retheme the entire runtime at once.

### The `style` option

`ToasterOptions.style` is a JavaScript record applied to the container as inline declarations:

```ts
createToaster({
  style: {
    '--normal-bg': '#fffdf8',
    '--border-radius': '12px',
    'font-family': 'Inter, sans-serif'
  }
})
```

It is not the same as declaring custom properties in CSS. It can contain ordinary CSS names, it has inline-style cascade priority, and it applies to one mount. In 3.2.1 the style map can override the default `--width`. The renderer reserves `--gap` and `--front-toast-height` after this map so CSS agrees with measured stack geometry; set spacing with the numeric `gap` option. Published 3.2.0 also overwrites `--width`: use the scoped external CSS recipe below with that version. There is no `width` toaster option. Replacing the map does not remove omitted ordinary declarations or palette keys; width and measured geometry are recomputed. To change one palette value while keeping a custom width, spread the existing `controller.options.style` into the new map.

### Classes and `unstyled`

`ToasterOptions.className`, `ToastOptions.className`, and `ToastOptions.descriptionClassName` attach your classes. `unstyled: true` writes `data-styled="false"`, which disables the built-in toast-body presentation while retaining the renderer layout and state attributes. `toast.custom()` is always unstyled.

## Container contract

The renderer appends this ordered list to the supplied root.

| Attribute             | Values                              | Meaning                                                                            |
| --------------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `data-notify-toaster` | empty marker                        | Stylesheet scope.                                                                  |
| `data-notify-theme`   | `'light' \| 'dark'`                 | Resolved theme. The `system` option is converted to the current preference.        |
| `data-y-position`     | `'top' \| 'bottom'`                 | Vertical anchor.                                                                   |
| `data-x-position`     | `'left' \| 'right' \| 'center'`     | Horizontal anchor.                                                                 |
| `data-lifted`         | `'true' \| 'false'`                 | Whether pointer or focus expansion currently lifts the stack.                      |
| `data-rich-colors`    | `'true' \| 'false'`                 | Toaster rich-color default.                                                        |
| `dir`                 | `'ltr' \| 'rtl'`                    | Resolved direction.                                                                |
| `class`               | consumer string                     | Present when `className` is set.                                                   |
| `tabindex`            | `-1`                                | Allows programmatic focus without adding the container to the normal tab order.    |
| `aria-label`          | consumer label or `'Notifications'` | Container name.                                                                    |
| `aria-live`           | `'polite'`                          | Announces non-urgent changes.                                                      |
| `aria-relevant`       | `'additions text'`                  | Announces additions and changed text, not removals.                                |
| `aria-atomic`         | `'false'`                           | Allows changed descendants rather than forcing the whole list as one announcement. |

Generated container custom properties are `--offset-top`, `--offset-right`, `--offset-bottom`, `--offset-left`, their four `--mobile-offset-*` equivalents, `--width`, `--gap`, and `--front-toast-height`. Direction rules provide icon, SVG, button, and close-button margin and position properties.

## Toast item contract

Each active state id has one toast item.

| Attribute              | Values                                         | Meaning                                                                                                                                   |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `data-notify-toast`    | empty marker                                   | Toast selector.                                                                                                                           |
| `data-id`              | stringified id                                 | Public id for inspection; number and string ids can serialize identically.                                                                |
| `data-notify-key`      | type-prefixed internal id                      | Renderer lookup key that preserves the number and string distinction.                                                                     |
| `data-type`            | `ToastType`                                    | Current variant.                                                                                                                          |
| `data-styled`          | `'true' \| 'false'`                            | Built-in presentation gate. False for custom content or `unstyled`.                                                                       |
| `data-rich-colors`     | `'true' \| 'false'`                            | Resolved toast and toaster setting.                                                                                                       |
| `data-promise`         | `'true' \| 'false'`                            | Whether the state record came from `toast.promise()`.                                                                                     |
| `data-mounted`         | `'true' \| 'false'`                            | Entry-transition state.                                                                                                                   |
| `data-removed`         | `'true' \| 'false'`                            | Exit-transition state.                                                                                                                    |
| `data-visible`         | `'true' \| 'false'`                            | Whether the item is inside `visibleToasts`.                                                                                               |
| `data-front`           | `'true' \| 'false'`                            | Newest, front item.                                                                                                                       |
| `data-expanded`        | `'true' \| 'false'`                            | Expanded-stack state.                                                                                                                     |
| `data-y-position`      | `'top' \| 'bottom'`                            | Resolved item position.                                                                                                                   |
| `data-x-position`      | `'left' \| 'right' \| 'center'`                | Resolved item position.                                                                                                                   |
| `data-index`           | integer string                                 | Newest-first stack index.                                                                                                                 |
| `data-swiping`         | `'true' \| 'false'`                            | Active pointer swipe.                                                                                                                     |
| `data-swiped`          | `'true' \| 'false'` when set                   | Whether pointer movement produced a swipe.                                                                                                |
| `data-swipe-out`       | `'true' \| 'false'`                            | Swipe-dismiss animation gate.                                                                                                             |
| `data-swipe-direction` | `'left' \| 'right' \| 'up' \| 'down'` when set | Dismissal animation direction.                                                                                                            |
| `data-dismissible`     | `'true' \| 'false'`                            | User-dismiss interaction gate.                                                                                                            |
| `data-invert`          | `'true' \| 'false'`                            | Resolved inversion.                                                                                                                       |
| `data-testid`          | consumer string                                | Optional test selector.                                                                                                                   |
| `data-snapshot`        | internal serialized value                      | Renderer change-detection cache. Do not depend on its format.                                                                             |
| `data-duration`        | number or `'Infinity'` string                  | Renderer timer cache.                                                                                                                     |
| `tabindex`             | `0`                                            | Makes the toast focusable for reading, pausing, keyboard activation, and dismissal.                                                       |
| `aria-busy`            | `'true' \| 'false'`                            | True for the loading type.                                                                                                                |
| `aria-busy`            | `'true'` while loading                         | Marks a loading toast as in progress. The toast has no `aria-label`, so its title, description and actions remain its accessible content. |

Renderer-owned item properties include `--index`, `--toasts-before`, `--z-index`, `--initial-height`, `--offset`, `--swipe-amount-x`, and `--swipe-amount-y`. Avoid overriding them.

## Inner elements

| Selector                                       | Element and condition                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `[data-close-button]`                          | Native button when close is requested and the content is neither loading nor custom. It also receives `data-disabled` and an `aria-label`. |
| `[data-icon]`                                  | Icon wrapper for typed icons, the loading spinner, or custom content. Generated decorative icons are `aria-hidden`.                        |
| `.notify-loading-wrapper[data-visible="true"]` | Loading spinner wrapper. The packaged renderer creates it as visible; the stylesheet also supports a false exit state.                     |
| `[data-custom]`                                | Custom callback or element mount point. It is a direct child of the toast item.                                                            |
| `[data-content]`                               | Title and description wrapper.                                                                                                             |
| `[data-title]`                                 | Primary text.                                                                                                                              |
| `[data-description]`                           | Optional secondary text.                                                                                                                   |
| `[data-actions]`                               | Flexible action row created when both cancel and action exist; keeps the message width readable.                                           |
| `[data-button][data-cancel]`                   | Native cancel button.                                                                                                                      |
| `[data-button][data-action]`                   | Native action button.                                                                                                                      |

The loading markup also uses `.notify-loading-wrapper`, `.notify-spinner`, `.notify-loading-bar`, and `.notify-loader`. These are the only built-in class selectors; consumer toast and container classes are optional.

## Responsive and motion behavior

At a maximum width of 600 pixels, the stylesheet makes the toaster full-width within the mobile offsets. Under `prefers-reduced-motion`, it removes the Notify transitions and animations, including the spinner animation. JavaScript auto-dismiss timing is unchanged, and DOM cleanup uses its fallback delay.

Use `duration: Infinity` or longer durations when content needs extra reading or interaction time. Reduced motion does not imply extended timing. See [Accessibility](accessibility.md).

## Related

- [Configuration](options.md)
- [Getting started](installation.md)
- [Accessibility](accessibility.md)

## Practical styling recipes

### A quieter, border-only toast

Load this rule after the package stylesheet. Retain a visible border and focus treatment.

```css
[data-notify-toast][data-styled='true'] {
  background: transparent;
  box-shadow: none;
}
```

### A tighter stack

Use the controller for the runtime-owned gap and offsets. Width is a container variable that can be overridden with an explicit, scoped CSS rule; the renderer writes its default inline.

```ts
createToaster({ gap: 10, offset: { bottom: 24 }, mobileOffset: { bottom: 80 } })
```

```css
[data-notify-toaster].wide-notifications {
  --width: 26.25rem !important;
}
```

Pass className: 'wide-notifications' to opt into that width. Check it at narrow widths; the packaged mobile rules use the mobile offsets.

### Loading spinner color

The loading state uses the normal palette. Target the generated bar inside a loading notification when a custom spinner color is needed.

```css
[data-notify-toast][data-type='loading'] .notify-loading-bar {
  background: currentColor;
}
```

### Direction and layout variables

The stylesheet derives --toast-icon-margin-start, --toast-icon-margin-end, --toast-svg-margin-start, --toast-svg-margin-end, --toast-button-margin-start, --toast-button-margin-end, --toast-close-button-start, --toast-close-button-end and --toast-close-button-transform from direction. Prefer dir: 'rtl' or 'ltr' over overriding this internal presentation family.

The stack also derives --y, --lift, --lift-amount and --scale from position and state. These are presentation internals, not controller options. Leave renderer-owned measurements and swipe amounts alone.

### Palette slots

Each of normal, success, info, warning and error has --TYPE-bg, --TYPE-text and --TYPE-border variables, with TYPE replaced by the slot name. There is no dedicated loading color slot: loading uses normal. The grayscale ramp --gray1 through --gray12 supplies the neutral theme. Set --border-radius on the container to change the toast corners.
