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

Usage

- The plugin registers a `Toaster` component and provides a `useSileo()` composable to access the controller.

Example in a single-file component:

```vue
<template>
  <Toaster />
  <button @click="show">Show</button>
</template>

<script setup>
import { notify, sileo } from '@samline/notify';
function show(){ notify.show({ title: 'Hello from Vue' }); }
</script>
 
## API

- `Notifications` plugin: registers a global component `SileoToaster` and exposes `app.config.globalProperties.$sileo`.
- `useSileo()` (composable): returns the `sileo` controller instance for programmatic use.

## Notes

- The Vue adapter integrates with the Vue lifecycle and works with Vue 3's Composition API.
- To customize appearance, import `dist/styles.css` or override the CSS variables.
```
