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

## `notify` object

In addition to `showNotifyToast`, the React integration exports a `notify` object with typed shorthand methods:

```jsx
import { notify } from '@samline/notify/react'

notify.success({ title: 'Done!' })
notify.error({ title: 'Something went wrong' })
notify.warning({ title: 'Watch out' })
notify.info({ title: 'FYI' })
notify.action({ title: 'Action required', button: { title: 'OK', onClick: () => {} } })
notify.dismiss('toast-id')
notify.clear()        // dismiss all
notify.clear('top-right') // dismiss only from a specific position
```

### `notify.promise`

Handles loading/success/error states automatically for async operations:

```jsx
import { notify } from '@samline/notify/react'

notify.promise(fetchData(), {
  loading: { title: 'Loading...' },
  success: { title: 'Data loaded!' },
  error: { title: 'Failed to load' },
})
```

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
