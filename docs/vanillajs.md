# Notify - VanillaJS

## Installation

Install the package from npm:

```bash
npm install @samline/notify
```

## Basic Usage

### UI Plug-and-play

```js
import { renderNotifyToasts, showNotifyToast } from '@samline/notify'
renderNotifyToasts()
showNotifyToast({
  title: 'Hello VanillaJS',
  type: 'success',
  duration: 2000,
})
```

### Manual usage

```js
import { showNotifyToast } from '@samline/notify'
showNotifyToast({
  title: 'Hello VanillaJS',
  type: 'success',
  duration: 2000,
})
```

## Subscribe to changes

```js
import { onNotifyToastsChange } from '@samline/notify'
onNotifyToastsChange((toasts) => {
  // Render the toasts in your HTML
  console.log(toasts)
})
```

## Available options

- `title`: string
- `type`: 'success' | 'loading' | 'error' | 'warning' | 'info' | 'action'
- `description`: string
- `duration`: number in ms
- `position`: 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
- `styles`: CSS classes object
- `fill`: background color
- `roundness`: border radius
- `autopilot`: boolean or object `{ expand, collapse }`
- `button`: object `{ title, onClick }`

## Advanced example

```js
showNotifyToast({
  title: 'Action required',
  description: 'Click the button to continue',
  type: 'action',
  button: {
    title: 'Continue',
    onClick: () => alert('You continued!'),
  },
  styles: {
    title: 'my-title',
    button: 'my-button',
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000,
})
```
