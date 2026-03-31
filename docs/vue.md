
# Sileo - Vue 3

## Installation

```bash
npm install agnostic-sileo
```

## Basic Usage

```js
import { showSileoToast, useSileoToasts } from 'agnostic-sileo/dist/agnostic-sileo';

showSileoToast({ title: 'Hello Vue', type: 'info' });

// In a component:
const { toasts } = useSileoToasts();
```


### Plug-and-play UI

```vue
<template>
  <SileoToasts />
</template>
<script setup>
import SileoToasts from '../src/SileoToasts.vue';
</script>
```

### Manual (composable)

```vue
<template>
  <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
</template>
<script setup>
import { useSileoToasts } from 'agnostic-sileo/dist/agnostic-sileo';
const { toasts } = useSileoToasts();
</script>
```

## Available Options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced Example

```js
showSileoToast({
  title: 'Action',
  description: 'Click the button',
  type: 'action',
  button: {
    title: 'Accept',
    onClick: () => alert('Accepted!')
  },
  fill: '#e0f7fa',
  roundness: 20,
  duration: 4000
});
```
