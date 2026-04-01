# Notify - Browser (CDN)

## Installation

Include the CSS and the browser bundle in your HTML via unpkg or jsDelivr:

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@1.0.2/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@1.0.2/dist/browser-notify.js"></script>
<script src="https://unpkg.com/@samline/notify@1.0.2/dist/render-notify-toasts.js"></script>
```

```html
<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.2/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.2/dist/browser-notify.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.2/dist/render-notify-toasts.js"></script>
```

This exposes a global `window.notify` object. To get the official Sileo-like UI, call `renderNotifyToasts()` once after loading the scripts.

## Available Methods

| Method | Description |
| ------ | ----------- |
| `window.notify.show(options)` | Add a toast to the queue |
| `window.notify.dismiss(id)` | Dismiss a toast by its id |
| `window.notify.clear()` | Dismiss all active toasts |
| `window.notify.subscribe(fn)` | Subscribe to toast changes — returns an unsubscribe function |
| `renderNotifyToasts(options?)` | Mount the official renderer with shared visual style |

## Toast Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Basic Usage

Use the official renderer so Browser/CDN matches the same visual system used across integrations:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@samline/notify@1.0.2/dist/styles.css" />
</head>
<body>
  <button onclick="window.notify.show({ title: 'Hello!', type: 'success', duration: 2000 })">Show toast</button>

  <script src="https://unpkg.com/@samline/notify@1.0.2/dist/browser-notify.js"></script>
  <script src="https://unpkg.com/@samline/notify@1.0.2/dist/render-notify-toasts.js"></script>
  <script>
    renderNotifyToasts({ position: 'top-right' })
  </script>
</body>
</html>
```

## Subscribe to Changes

`window.notify.subscribe` calls your function immediately with the current toasts, and again every time the list changes. It returns an unsubscribe function.

```html
<script>
  var unsubscribe = window.notify.subscribe(function (toasts) {
    console.log(toasts) // Array of active toast objects
  })

  // To stop listening:
  // unsubscribe()
</script>
```

## Advanced Example

```html
<script>
  window.notify.show({
    title: 'Action required',
    description: 'Click the button to continue',
    type: 'action',
    button: {
      title: 'Accept',
      onClick: function () {
        alert('Accepted!')
        window.notify.clear()
      },
    },
    fill: '#e0ffe0',
    roundness: 22,
    duration: 5000,
  })
</script>
```
