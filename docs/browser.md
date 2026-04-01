# Notify - Browser (CDN)

## Installation

Include the CSS and the browser bundle in your HTML via unpkg or jsDelivr:

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@1.0.1/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@1.0.1/dist/browser-notify.js"></script>
```

```html
<!-- jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.1/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@1.0.1/dist/browser-notify.js"></script>
```

This exposes a global `window.notify` object. The library manages toast state — **you are responsible for subscribing and rendering the toasts in your own HTML**. There is no built-in UI injected automatically.

## Available Methods

| Method | Description |
| ------ | ----------- |
| `window.notify.show(options)` | Add a toast to the queue |
| `window.notify.dismiss(id)` | Dismiss a toast by its id |
| `window.notify.clear()` | Dismiss all active toasts |
| `window.notify.subscribe(fn)` | Subscribe to toast changes — returns an unsubscribe function |

## Toast Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Basic Usage

You must subscribe to the toast queue and render the toasts yourself. Here is a minimal complete example:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@samline/notify@1.0.1/dist/styles.css" />
</head>
<body>
  <button onclick="window.notify.show({ title: 'Hello!', type: 'success', duration: 2000 })">Show toast</button>

  <script src="https://unpkg.com/@samline/notify@1.0.1/dist/browser-notify.js"></script>
  <script>
    var container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:0.5rem;'
    document.body.appendChild(container)

    window.notify.subscribe(function (toasts) {
      container.innerHTML = ''
      toasts.forEach(function (toast) {
        var el = document.createElement('div')
        el.style.cssText = 'background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.12);padding:.75rem 1.25rem;min-width:200px;'
        el.textContent = toast.title
        container.appendChild(el)
      })
    })
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
