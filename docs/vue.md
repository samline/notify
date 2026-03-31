# Sileo - Vue 3

## Instalación

```bash
npm install agnostic-sileo
```

## Uso básico

```js
import { showSileoToast, useSileoToasts } from 'agnostic-sileo/dist/agnostic-sileo';

showSileoToast({ title: 'Hola Vue', type: 'info' });

// En un componente:
const { toasts } = useSileoToasts();
```

```vue
<template>
  <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
</template>
<script setup>
import { useSileoToasts } from 'agnostic-sileo/dist/agnostic-sileo';
const { toasts } = useSileoToasts();
</script>
```

## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [API general](../README.md#api-general))

## Ejemplo avanzado

```js
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
