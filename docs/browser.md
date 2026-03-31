
# Sileo - Browser (CDN)

## Installation

Include the generated UMD file (`dist/browser-sileo.js`) in your HTML:

```html
<script src="dist/browser-sileo.js"></script>
```

## Basic Usage

```html
<script>
  Sileo.show({ title: 'Hello from Browser/CDN', type: 'success', duration: 2000 });
</script>
```

## Available Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced Example

```html
<script>
  Sileo.show({
    title: 'Action',
    description: 'Click the button',
    type: 'action',
    button: {
      title: 'Accept',
      onClick: function() { alert('Accepted!'); }
    },
    fill: '#e0ffe0',
    roundness: 22,
    duration: 5000
  });
</script>
```
