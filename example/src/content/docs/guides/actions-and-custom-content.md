---
title: Actions and custom content
description: Build undo, retry, persistent, and custom-DOM notifications with safe and accessible interaction.
template: doc
---

Use standard toast actions when a short label and callback are enough. Use `toast.custom()` when you need consumer-owned DOM. Essential or complex workflows should remain in the page or a dialog rather than exist only in a transient toast.

## Action and cancel buttons

```ts
toast('Message archived', {
  type: 'action',
  duration: 8000,
  action: {
    label: 'Undo archive',
    onClick: () => restoreMessage(messageId)
  },
  cancel: { label: 'Dismiss' }
})
```

Both controls are native `button` elements and close the toast by default. Set `closeOnClick: false` when the toast must remain while an action runs.

```ts
toast.error('Upload failed', {
  duration: Infinity,
  closeButton: true,
  action: {
    label: 'Retry upload',
    closeOnClick: false,
    onClick: () => retryUpload()
  }
})
```

For a persistent toast, always provide a usable dismissal or recovery path. `dismissible: false` blocks user dismissal but does not stop automatic or programmatic dismissal.

## Custom DOM

```ts
toast.custom(
  (container) => {
    const heading = document.createElement('strong')
    heading.textContent = 'Build complete'

    const detail = document.createElement('span')
    detail.textContent = ' Production assets are ready.'

    container.append(heading, detail)
  },
  { duration: 8000 }
)
```

The callback receives an empty mount element. Notify does not sanitize the DOM, apply the standard toast-body presentation, or generate a close button for custom content.

## Safety and accessibility checklist

- Assign untrusted strings with `textContent`; do not interpolate them into `innerHTML`.
- Prefer native buttons and links over clickable generic elements.
- Include meaningful visible text; do not communicate status through color alone.
- Preserve focus styles and reduced-motion behavior when replacing package styles.
- Give actions specific labels such as `Undo deletion` or `View invoice`.
- Keep critical errors and required actions in persistent page content too.

## When a normal toast is enough

Use `message` plus `description`, `action`, `cancel`, `closeButton`, `className`, and `descriptionClassName` before reaching for custom DOM. The standard renderer already supplies keyboard interaction, semantic buttons, typed labels, focus-paused timing, and data attributes for styling.

## Related

- [Configuration](/notify/reference/configuration/#actions)
- [Accessibility](/notify/reference/accessibility/)
- [CSS styling](/notify/reference/css-styling/)
- [Examples](/notify/reference/examples/)
