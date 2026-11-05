# Accessibility and behavior

Notify supplies accessible mechanics, while the application remains responsible for content, timing, contrast, and testing with the assistive technologies it supports.

## Rendered semantics

The toaster is an ordered list with an accessible label. It does not set `role="region"`, `role="status"`, or `role="alert"`.

```html
<ol
  data-notify-toaster
  aria-label="Notifications"
  aria-live="polite"
  aria-relevant="additions text"
  aria-atomic="false"
  tabindex="-1"
></ol>
```

New toast list items and changed text are eligible for polite announcement. Removals are not included by `aria-relevant`. Because announcements depend on the browser and screen-reader combination, and on timing, never use a toast as the only presentation of a critical error or a required action.

Each toast is a focusable list item. Loading toasts set `aria-busy="true"`; the other types set it to `false`. Toasts never receive an `aria-label`, so screen readers read the title, description and action labels exactly as rendered. Generated icons are decorative and hidden from assistive technology. When a focused toast is dismissed, focus moves to the next visible toast or back to the element that was focused before the toaster.

`customAriaLabel` is a historical toaster option: it replaces the **container's** accessible label. `containerAriaLabel` defaults to `Notifications`. Neither option changes the text of an individual toast.

## Keyboard behavior

- `Alt+T` is the default document-level hotkey. It focuses the newest toast, or the empty container.
- The hotkey is ignored while typing in an input, textarea, select, or contenteditable element.
- `hotkey: []` disables it. Another array changes the combination, and every entry has to match.
- Focusing within the stack expands it for reading. Focusing a toast pauses its auto-dismiss timer. Leaving it resumes the remaining time.
- Enter or Space invokes `onClick` only when the toast list item itself is focused.
- Delete or Backspace dismisses the focused toast when `dismissible` is not `false`. Edit keys in inputs, textareas, selects and editable content retain their normal editing behavior.
- Escape collapses an expanded stack while focus is inside it. It does not dismiss.
- Close, action, and cancel controls are native buttons with normal tab and activation behavior.

The renderer restores the element that was focused when the toaster mounted, but only if focus is still inside that toaster when it is destroyed. It does not move focus into a toast when one appears.

## Close and dismissal rules

A close button is generated only when close is enabled and the toast is neither loading nor custom. `closeButtonAriaLabel` defaults to `Close toast`; translate it and make its purpose clear in the page language.

`dismissible: false` disables close-button activation, swipe dismissal, and Delete or Backspace dismissal. It does **not** disable auto-close or programmatic `toast.dismiss()`. Avoid requesting a close button on a non-dismissible toast, because the renderer can show an inert button.

Loading toasts do not auto-close, do not invoke the body `onClick`, do not swipe, and do not render close buttons. Always supply a terminal state, an explicit programmatic dismissal, or another recovery path.

## Content and timing guidance

- Keep messages concise and put the outcome first: `Invoice uploaded`, not `Success`.
- Do not communicate state through color or icon alone. Include meaningful text.
- Use `error` and `warning` labels accurately, but keep urgent validation near the affected field as persistent content.
- Choose durations based on reading length. Four seconds is the default, not a universal accessibility target.
- Use a longer duration for descriptions and actions. Use `duration: Infinity` only when a clear close mechanism is available.
- Give action buttons specific labels such as `Undo deletion` or `View invoice`.
- Do not put essential actions only in a transient toast.
- Avoid rapid streams of updates into the polite live region. Consolidate progress where possible.

## Reduced motion

The packaged CSS removes Notify transitions and animations under `prefers-reduced-motion`. The loading spinner stops animating too. JavaScript timers keep their configured durations, so reduced motion does not automatically provide more reading time.

If you replace the stylesheet or use `unstyled: true`, preserve visible focus, readable contrast, responsive placement, reduced-motion handling, and pointer targets of at least 24 by 24 CSS pixels for controls.

## Custom content

`toast.custom()` mounts the DOM you provide and does not create the standard close button. Use semantic HTML, native controls, descriptive labels, and safe text assignment. Notify does not sanitize custom HTML and does not manage focus inside it.

For complex or mandatory interaction, use an inline disclosure or a dialog rather than a toast.

## Related

- [Configuration](options.md)
- [CSS styling](css-styling.md)
- [Actions and custom content](guides/actions-and-custom-content.md)

## Interactive custom content

`toast.custom` can host consumer-owned DOM, including a native form. Give each control a label, keep a dismissal action reachable and store an important result in persistent page content. Pointer gestures ignore buttons, links and editable controls; changing position refreshes gesture eligibility on existing notifications. A canceled pointer gesture resets its transform instead of leaving the card displaced.

Prefer a dialog or an ordinary page form when content is long, a choice is blocking, or modal focus management is required.
