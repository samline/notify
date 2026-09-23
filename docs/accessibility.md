# Accessibility

Notify provides accessible mechanics, while the application remains responsible for content, timing, contrast, and testing with its supported assistive technologies.

## Semantics

The toaster is an ordered list with `aria-live="polite"`, `aria-relevant="additions text"`, and an accessible label. Each toast is a focusable list item. Loading items set `aria-busy="true"`; generated icons are decorative.

Announcements vary across browser and screen-reader combinations. Never use a toast as the only presentation of a critical error or required action.

## Keyboard behavior

- `Alt+T` focuses the newest toast or empty container; `hotkey: []` disables it.
- The hotkey is ignored while typing in an input, textarea, select, or editable element.
- Focus pauses auto-dismiss and blur resumes the remaining time.
- Enter or Space invokes body `onClick` when the list item itself is focused.
- Delete or Backspace dismisses a dismissible focused toast.
- Escape collapses an expanded stack.
- Close, action, and cancel controls are native buttons.

## Dismissal and timing

`dismissible: false` blocks close, swipe, and keyboard dismissal, but not automatic or programmatic dismissal. Loading and custom toasts have no generated close button. Persistent content (`duration: Infinity`) needs an explicit recovery or dismissal path.

Use concise outcome-first text, specific action labels, and longer durations for descriptions or controls. Do not rely on color or icons alone.

## Reduced motion and custom content

The packaged CSS removes animations under `prefers-reduced-motion`, but JavaScript timing is unchanged. Custom or unstyled content must preserve visible focus, contrast, responsive placement, reduced motion, and adequate control sizes.

`toast.custom()` does not sanitize DOM or manage focus. Prefer semantic elements and `textContent`; use a page disclosure or dialog for complex mandatory interaction.

See [Options](options.md), [CSS styling](css-styling.md), and [Actions in recipes](recipes.md#2-undo-with-action-and-cancel).
