
# React

## Quick start

Install the package and peer dependencies:

```bash
npm install @samline/notify react react-dom
```

Import and render the `Toaster` component in your app root:

```tsx
import React from 'react';

import { Toaster, notify } from '@samline/notify/react';

export function App() {
  return (
    <>
      <Toaster />
      <button onClick={() => notify.show({ title: 'Done', type: 'success' })}>Show</button>
    </>
  );
}
```

> **Note:**
> Import `@samline/notify/dist/styles.css` in your main entrypoint or include it in your HTML for correct appearance.
> CDN: `<link rel="stylesheet" href="https://unpkg.com/@samline/notify@0.1.15/dist/styles.css">`


## API

- `<Toaster />` subscribes to the notification controller and renders toasts.
- Use `notify.show({...})` or shortcut methods (`notify.success`, `notify.error`, `notify.info`, `notify.warning`, `notify.action`, `notify.promise`, `notify.dismiss`, `notify.clear`) to trigger notifications. Import from `@samline/notify/react`.

### Methods

```ts
notify.show(options)
notify.success(options)
notify.error(options)
notify.info(options)
notify.warning(options)
notify.action(options)
notify.promise(promise, { loading, success, error })
notify.dismiss(id)
notify.clear()
```

### Options

| Property      | Type                                   | Default     | Description                                 |
| ------------- | -------------------------------------- | ----------- | ------------------------------------------- |
| `title`       | string                                 | —           | Toast title                                 |
| `description` | string                                 | —           | Optional body text                          |
| `type`        | `info\|success\|error\|warning`        | `info`      | Visual intent                               |
| `position`    | string                                 | `top-right` | One of toast positions                      |
| `duration`    | number                                 | `4000`      | Auto-dismiss timeout in ms (0 = persistent) |
| `button`      | { title: string, onClick: () => void } | —           | Optional action button                      |

## Tips

- You can customize positions and styles by overriding CSS variables or importing the stylesheet in your preferred way.

## API

- `Toaster` component: mounts a toast container and subscribes to the core controller.
- Primary API: use `notify` (e.g. `notify.show(...)`). A backward-compatible `sileo` alias is also available: `sileo.show(...)`.

## Notes

- The React adapter renders toasts in a React-friendly way and is SSR-safe when used with client-only mounting.
- To customize styles, import `dist/styles.css` or override the CSS variables defined in the stylesheet.
