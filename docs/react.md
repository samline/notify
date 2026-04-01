# React

Use the React entry when you want the full component model with the shared toast runtime.

## Install

```bash
bun add @samline/notify react react-dom
```

## Basic usage

```tsx
import { Toaster, toast } from '@samline/notify/react'

export function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors />
      <button onClick={() => toast.success('Saved')}>Save</button>
    </>
  )
}
```

## Complete example

```tsx
import React from 'react'
import { Toaster, toast, useNotify } from '@samline/notify/react'

function SaveButton() {
  const showToast = useNotify()

  return (
    <button
      onClick={() => {
        const id = showToast('Preparing upload...', {
          id: 'upload-status',
          description: 'The same toast will be updated after the request finishes.',
        })

        void toast.promise(fetch('/api/upload').then((response) => response.json()), {
          loading: 'Uploading files...',
          success: (data) => ({
            message: 'Upload complete',
            description: data.count ? `${data.count} files uploaded` : 'No files were uploaded',
            id,
          }),
          error: 'Upload failed',
        })
      }}
    >
      Upload
    </button>
  )
}

export function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        expand
        duration={5000}
        hotkey={['altKey', 'KeyT']}
        toastOptions={{
          className: 'app-toast',
          closeButton: true,
        }}
      />
      <SaveButton />
    </>
  )
}
```

## Customization

React supports the shared toaster options plus React-specific controls:

- `hotkey` to focus or open the toaster
- `toastOptions` for defaults applied to every toast
- `style` for inline root styling
- `swipeDirections` for gesture control
- `icons` for custom status icons

## Notes

- `toast.dismiss(id)` works across the whole app.
- `toast.getToasts()` and `toast.getHistory()` are available for debugging or building custom UI around the runtime.
- Keep a single `<Toaster />` mounted near the root unless you explicitly want multiple toaster instances.
