
# Sileo - VanillaJS

## Installation

Install the package from npm:

```bash
npm install notify
```

Or using yarn:

```bash

```

## Basic Usage


### Plug-and-play UI

```js
import { renderSileoToasts, showSileoToast } from '../src/render-sileo-toasts.js';
renderSileoToasts();
showSileoToast({
  title: 'Hello VanillaJS',
  type: 'success',
  duration: 2000
});
```

### Manual

```js
import { showSileoToast } from 'notify/dist/notify';
showSileoToast({
  title: 'Hello VanillaJS',
  type: 'success',
  duration: 2000
});
```

## Subscribe to changes

```js
import { onSileoToastsChange } from 'notify/dist/notify';

onSileoToastsChange((toasts) => {
  // Render toasts in your HTML
  console.log(toasts);
});
```

## Available Options

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

## Advanced Example

```js
showSileoToast({
  title: 'Action required',
  description: 'Click the button to continue',
  type: 'action',
  button: {
    title: 'Continue',
    onClick: () => alert('You continued!')
  },
  styles: {
    title: 'my-title',
    button: 'my-button'
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000
});
```
