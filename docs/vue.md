# Vue 3

## Quick start

Install the package:

```bash
npm install @samline/notify vue
```

Register the `Toaster` component in your app:

```js
import { createApp } from 'vue';
import App from './App.vue';
import { Toaster } from '@samline/notify/vue';

const app = createApp(App);
app.component('Toaster', Toaster);
app.mount('#app');
```



Use the `notify` controller to show notifications:

```js
import { notify } from '@samline/notify/vue';
notify.show({ title: 'Hello from Vue' });
```

Or access it globally in any component via `this.$notify` (if you use the plugin install):

```js
this.$notify.show({ title: 'From global' });
```

In your template:

```vue
<template>
	<Toaster />
	<button @click="show">Show</button>
</template>

<script setup>
import { notify } from '@samline/notify/vue';
function show(){ notify.show({ title: 'Hello from Vue' }); }
</script>
```

> **Note:**
> Import `@samline/notify/dist/styles.css` in your main entrypoint or HTML for correct appearance.


## API

- `Toaster`: Main visual component (same as in React and Svelte).
- `notify`: Programmatic controller for showing notifications. Import from `@samline/notify/vue` or use `this.$notify` if using the plugin.
- Advanced: The `Notifications` plugin is available for global/legacy registration, but direct use of `Toaster` is recommended for most apps.
- `useSileo()`: Composable that returns the `sileo` controller if you prefer.

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

- The Vue adapter integrates with the Vue lifecycle and works with Vue 3's Composition API.
- You can customize appearance by importing the stylesheet or overriding CSS variables.
```
