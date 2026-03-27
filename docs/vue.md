# Vue 3

Quick start

```js
import { createApp } from 'vue';
import App from './App.vue';
import Notifications from '@samline/notify/vue';

const app = createApp(App);
app.use(Notifications);
app.mount('#app');
```

Uso

- El plugin registra un componente `Toaster` y un `useSileo()` composable para interactuar con el controller.

Ejemplo en plantilla:

```vue
<template>
  <Toaster />
  <button @click="show">Mostrar</button>
</template>

<script setup>
import { notify, sileo } from '@samline/notify';
function show(){ notify.show({ title: 'Hola desde Vue' }); }
</script>
 
## API

- `Notifications` plugin: registers a global component `SileoToaster` and exposes `app.config.globalProperties.$sileo`.
- `useSileo()` (composable): returns the `sileo` controller instance for programmatic use.

## Notes

- The Vue adapter integrates with the Vue lifecycle and is compatible with Vue 3's Composition API.
- To customize appearance, import `dist/styles.css` or override CSS variables.
```
