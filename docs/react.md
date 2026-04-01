npm install @samline/notify/react

# Notify - React

## Installation

```bash
npm install @samline/notify
```

## Basic usage

```jsx
import { Toaster, showNotifyToast } from '@samline/notify/react'

function App() {
  return (
    <>
      <Toaster position='top-right' />
      <button
        onClick={() =>
          showNotifyToast({ title: 'Hello React', type: 'success' })
        }
      >
        Show Toast
      </button>
    </>
  )
}
```

## Available options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced example

```jsx
showNotifyToast({
  title: 'Action',
  description: 'Click the button',
  type: 'action',
  button: {
    title: 'Accept',
    onClick: () => alert('Accepted!'),
  },
  fill: '#e0f7fa',
  roundness: 20,
  duration: 4000,
})
```
