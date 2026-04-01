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

## Basic Usage

```html
<script>
  Notify.show({
    title: 'Hello from Browser/CDN',
    type: 'success',
    duration: 2000,
  })
</script>
```

## Available Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced Example

```html
<script>
  Notify.show({
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
