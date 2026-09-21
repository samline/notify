---
title: Accessibility
description: Actual Notify semantics, live-region behavior, keyboard controls, timing, and accessible usage guidance.
template: doc
sidebar:
  order: 8
---

Notify supplies useful mechanics, but accessible notification content and timing remain application responsibilities. Test your final page with keyboard navigation and the screen readers you support.

## Rendered semantics

The toaster is an ordered list (`<ol>`) with an accessible label. It does not set `role="region"`, `role="status"`, or `role="alert"`.

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

New toast list items and changed text are eligible for polite announcement. Removals are not included by `aria-relevant`. Because announcements depend on browser/screen-reader combinations and timing, do not use a toast as the only presentation of a critical error or required action.

Each toast is a focusable `<li tabindex="0">`. Loading toasts set `aria-busy="true"`; other types set it to false. Non-normal variants receive labels such as `success: Saved`. Normal toasts have no custom label and expose their descendant text. Generated icons are decorative and hidden from assistive technology.

`customAriaLabel` is a historical toaster option: it replaces the **container's** accessible label. `containerAriaLabel` defaults to `Notifications`. Neither option changes individual toast text.

## Keyboard behavior

- `Alt+T` is the default document-level hotkey and focuses the newest toast, or the empty container.
- The hotkey is ignored while typing in an input, textarea, select, or contenteditable element.
- `hotkey: []` disables it; another array changes the all-keys-must-match combination.
- Focusing a toast pauses its auto-dismiss timer; leaving it resumes the remaining time.
- Enter or Space invokes `onClick` only when the toast `<li>` itself is focused.
- Delete or Backspace dismisses the focused toast when `dismissible !== false`.
- Escape collapses an expanded stack while focus is inside it; it does not dismiss.
- Native close, action, and cancel buttons use normal Tab and activation behavior.

The renderer restores the element that was focused when the toaster mounted only if focus is still within that toaster at destruction time. It does not move focus into a toast when one appears.

## Close and dismissal rules

Close buttons are generated only when close is enabled and the toast is neither loading nor custom. `closeButtonAriaLabel` defaults to `Close toast`; translate it and make its purpose clear in the page language.

`dismissible: false` disables close-button activation, swipe dismissal, and Delete/Backspace dismissal. It does **not** disable auto-close or programmatic `toast.dismiss()`. Avoid requesting a close button on a non-dismissible toast because the renderer can show an inert button.

Loading toasts do not auto-close, invoke body `onClick`, swipe, or render close buttons. Always supply a terminal state, explicit programmatic dismissal, or another recovery path.

## Content and timing guidance

- Keep messages concise and put the outcome first: `Invoice uploaded`, not `Success`.
- Do not communicate state through color or icon alone; include meaningful text.
- Use `error` and `warning` labels accurately, but keep truly urgent validation near the affected field as persistent content.
- Choose durations based on reading length. Four seconds is the default, not a universal accessibility target.
- Use a longer duration for descriptions and actions. Use `Infinity` only when a clear close mechanism is available.
- Give action buttons specific labels such as `Undo deletion` or `View invoice`.
- Do not put essential actions only in a transient toast.
- Avoid rapid streams of updates into the polite live region; consolidate progress where possible.

## Reduced motion

The packaged CSS removes Notify transitions and animations under `prefers-reduced-motion`. The spinner stops animating too. JavaScript timers keep their configured durations, so reduced motion does not automatically provide more reading time.

If you replace the stylesheet or use `unstyled: true`, preserve visible focus, readable contrast, responsive placement, reduced-motion handling, and at least 24 by 24 CSS pixel pointer targets for controls.

## Custom content

`toast.custom()` mounts DOM you provide and does not create the standard close button. Use semantic HTML, native controls, descriptive labels, and safe text assignment. Notify does not sanitize custom HTML or manage focus inside it.

For complex or mandatory interaction, use an inline disclosure or dialog rather than a toast.
