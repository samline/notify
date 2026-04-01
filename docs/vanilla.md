# Vanilla JS

Use the root entry when you want the package without a framework.

## Install

```bash
bun add @samline/sonner
```

## Basic usage

```ts
import { createToaster, toast } from '@samline/sonner'

createToaster({
  position: 'bottom-right',
  richColors: true,
})

document.querySelector('#save')?.addEventListener('click', () => {
  toast.success('Saved')
})
```

## Complete example

```html
<button id="save">Save</button>
<button id="load">Load profile</button>
```

```ts
import { configureToaster, toast } from '@samline/sonner'

const toaster = configureToaster({
  position: 'bottom-right',
  duration: 4500,
  closeButton: true,
  richColors: true,
})

document.querySelector('#save')?.addEventListener('click', async () => {
  const id = toast.loading('Saving profile...', {
    description: 'This example updates the same toast by id.',
    id: 'profile-save',
  })

  await new Promise((resolve) => setTimeout(resolve, 1200))

  toast.success('Profile saved', {
    id,
    description: 'The loading toast was updated in place.',
  })
})

document.querySelector('#load')?.addEventListener('click', () => {
  toast.promise(fetch('/api/profile').then((response) => response.json()), {
    loading: 'Loading profile...',
    success: (data) => ({
      message: 'Profile loaded',
      description: `User: ${data.name}`,
    }),
    error: 'Could not load profile',
  })
})

window.addEventListener('beforeunload', () => {
  toaster.destroy()
})
```

## Customization

The root entry accepts the shared toaster options from [api.md](api.md).

For example:

```ts
createToaster({
  position: 'top-center',
  theme: 'system',
  offset: {
    top: 16,
    right: 16,
  },
  mobileOffset: 12,
})
```

## Notes

- The toast state is shared across the page.
- Calling `toast()` will mount the toaster lazily if the DOM is available.
- Use `destroyToaster()` when you need to fully reset the runtime.
