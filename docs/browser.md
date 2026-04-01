# Notify - Browser (CDN)

## Installation

Include the CSS and the browser bundle in your HTML via unpkg or jsDelivr:

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@1.0.0/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@1.0.0/dist/browser-notify.js"></script>
```

```html
<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.0/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.0/dist/browser-notify.js"></script>
```

This exposes a global `Notify` object you can use immediately.

## Available Methods

| Method | Description |
| ------ | ----------- |
| `window.Notify.show(options)` | Show a toast |
| `window.Notify.dismiss(id)` | Dismiss a toast by its id |
| `window.Notify.clear()` | Dismiss all active toasts |
| `window.Notify.subscribe(fn)` | Subscribe to toast changes — returns an unsubscribe function |

## Toast Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Basic Usage

```html
<script>
  window.Notify.show({
    title: 'Hello from Browser/CDN',
    type: 'success',
    duration: 2000,
  })
</script>
```

## Subscribe to Changes

```html
<script>
  const unsubscribe = window.Notify.subscribe(function (toasts) {
    console.log(toasts)
  })

  // Later:
  // window.Notify.dismiss('toast-id')
  // window.Notify.clear()
  // unsubscribe()
</script>
```

## Advanced Example

```html
<script>
  window.Notify.show({
    title: 'Action',
    description: 'Click the button',
    type: 'action',
    button: {
      title: 'Accept',
      onClick: function () {
        alert('Accepted!')
      },
    },
    fill: '#e0ffe0',
    roundness: 22,
    duration: 5000,
  })
</script>
```
