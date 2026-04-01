# Notify - VanillaJS

## Installation

Install the package from npm:

```bash
npm install @samline/notify
```

## Basic Usage

The library manages toast state — **you must subscribe to the queue and render the toasts yourself**. There is no UI injected automatically.

```js
import { showNotifyToast, onNotifyToastsChange } from '@samline/notify'

// 1. Subscribe and render
onNotifyToastsChange(function (toasts) {
  // Render the toasts however you like — example with a simple container:
  const container = document.getElementById('toasts')
  container.innerHTML = ''
  toasts.forEach(function (toast) {
    const el = document.createElement('div')
    el.textContent = toast.title
    container.appendChild(el)
  })
})

// 2. Show a toast
showNotifyToast({
  title: 'Hello VanillaJS',
  type: 'success',
  duration: 2000,
})
```

## Subscribe to changes

`onNotifyToastsChange` is called immediately with the current toasts and again every time the list changes. It returns an unsubscribe function.

```js
import { onNotifyToastsChange } from '@samline/notify'

const unsubscribe = onNotifyToastsChange((toasts) => {
  console.log(toasts) // Array of active toast objects
})

// To stop listening:
// unsubscribe()
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
