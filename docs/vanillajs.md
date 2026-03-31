

# Notify - VanillaJS


## Instalación

Instala el paquete desde npm:

```bash
npm install notify
```

## Basic Usage
npm install @samline/notify


### UI Plug-and-play

```js
import { renderSileoToasts, showSileoToast } from '@samline/notify';
renderSileoToasts();
showSileoToast({
  title: 'Hola VanillaJS',
  type: 'success',
  duration: 2000
});
```


### Uso manual

```js
import { showSileoToast } from '@samline/notify';
showSileoToast({
  title: 'Hola VanillaJS',
  type: 'success',
  duration: 2000
});
```

onSileoToastsChange((toasts) => {

## Suscribirse a cambios
```js
import { onSileoToastsChange } from '@samline/notify';
onSileoToastsChange((toasts) => {
  // Renderiza los toasts en tu HTML
  console.log(toasts);
});
```


## Opciones disponibles

- `title`: string
- `type`: 'success' | 'loading' | 'error' | 'warning' | 'info' | 'action'
- `description`: string
- `duration`: número en ms
- `position`: 'top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'
- `styles`: objeto de clases CSS
- `fill`: color de fondo
- `roundness`: border radius
- `autopilot`: booleano u objeto `{ expand, collapse }`
- `button`: objeto `{ title, onClick }`


## Ejemplo avanzado

```js
showSileoToast({
  title: 'Acción requerida',
  description: 'Haz clic en el botón para continuar',
  type: 'action',
  button: {
    title: 'Continuar',
    onClick: () => alert('¡Continuaste!')
  },
  styles: {
    title: 'mi-titulo',
    button: 'mi-boton'
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000
});
```
