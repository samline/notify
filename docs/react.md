# React

Installation

```bash
npm install @samline/notify react react-dom
```

Basic usage

```tsx
import React from 'react';
import { notify, sileo } from '@samline/notify';
import { Toaster } from '@samline/notify/react';

function App(){
  return (
    <>
      <Toaster />
      <button onClick={() => notify.show({ title: 'Done', type: 'success' })}>Show</button>
    </>
  )
}
```

Notes

- The `Toaster` component subscribes to the core controller and renders toasts.
- You can customize positions and styles by importing `dist/styles.css`.

## Quick start

Install:

```bash
npm install @samline/notify react react-dom
```

Import and render the React `Toaster` in your app:

```tsx
import React from 'react';
import { Toaster } from '@samline/notify/react';
import { notify, sileo } from '@samline/notify';

export function App(){
  return (
    <div>
      <Toaster />
      <button onClick={() => notify.show({ title: 'Done', type: 'success' })}>Show</button>
    </div>
  );
}
```

## API

- `Toaster` component: mounts a toast container and subscribes to the core controller.
- Primary API: use `notify` (e.g. `notify.show(...)`). A backward-compatible `sileo` alias is also available: `sileo.show(...)`.

## Notes

- The React adapter renders toasts in a React-friendly way and is SSR-safe when used with client-only mounting.
- To customize styles, import `dist/styles.css` or override the CSS variables defined in the stylesheet.
