

# Notify - Vue 3


## Instalación

```bash
npm install @samline/notify/vue
```


## Uso básico

import { showSileoToast, useSileoToasts } from '@samline/notify/vue';

showSileoToast({ title: 'Hola Vue', type: 'info' });

// En un componente:
const { toasts } = useSileoToasts();
```



### UI Plug-and-play

```vue
<template>
  <SileoToasts />
</template>
<script setup>
import SileoToasts from '@samline/notify/vue';
</script>
```


### Uso manual (composable)

```vue
<template>
  <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
</template>
<script setup>
import { useSileoToasts } from '@samline/notify/vue';
const { toasts } = useSileoToasts();
</script>
```


## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [General API](../README.md#general-api))


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
