# React

Instalación

```bash
npm install @samline/notify react react-dom
```

Uso básico

```tsx
import React from 'react';
import { notify, sileo } from '@samline/notify';
import { Toaster } from '@samline/notify/react';

function App(){
  return (
    <>
      <Toaster />
      <button onClick={() => notify.show({ title: 'Hecho', type: 'success' })}>Mostrar</button>
    </>
  )
}
```

Notas

- El componente `Toaster` se suscribe al `sileo` controller y renderiza toasts.
- Puedes personalizar posiciones y estilos importando `dist/styles.css`.

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
      <button onClick={() => notify.show({ title: 'Hecho', type: 'success' })}>Mostrar</button>
    </div>
  );
}
```

## API

- `Toaster` component: mounts a toast container and subscribes to the core controller.
- Primary API: use `notify` (e.g. `notify.show(...)`). A backward-compatible `sileo` alias is also available: `sileo.show(...)`.

## Notes

- The React adapter renders toasts in a React-friendly way and is SSR-safe when used with client-only mounting.
- To customize styles, import `dist/styles.css` or override CSS variables defined in the stylesheet.
