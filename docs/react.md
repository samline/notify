
# Notify - React

npm install @samline/notify/react
## Instalación

```bash
npm install @samline/notify/react
```
import { Toaster, showSileoToast } from '@samline/notify/react';

## Uso básico

```jsx
import { Toaster, showSileoToast } from '@samline/notify/react';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <button onClick={() => showSileoToast({ title: 'Hola React', type: 'success' })}>
        Mostrar Toast
      </button>
    </>
  );
```


## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [General API](../README.md#general-api))


## Ejemplo avanzado

```jsx
showSileoToast({
  title: 'Acción',
  description: 'Haz clic en el botón',
  type: 'action',
  button: {
    title: 'Aceptar',
    onClick: () => alert('¡Aceptado!')
  },
  fill: '#e0f7fa',
  roundness: 20,
  duration: 4000
});
```
