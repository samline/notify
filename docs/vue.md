# Notify - Vue 3

## Installation

```bash
npm install @samline/notify
```

## Basic usage

```js
import { showNotifyToast, useNotifyToasts } from '@samline/notify/vue'

showNotifyToast({ title: 'Hello Vue', type: 'info' })

// In a component:
const { toasts } = useNotifyToasts()
```

### Manual usage (composable)

```vue
<template>
  <div v-for="toast in toasts" :key="toast.id">{{ toast.title }}</div>
</template>
<script setup>
import { useNotifyToasts } from '@samline/notify/vue'
const { toasts } = useNotifyToasts()
</script>
```

The package currently exposes the Vue composable API. If you want a drop-in visual component, use your own Vue template and map over `toasts`.

## Available options

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (see [General API](../README.md#general-api))

## Advanced example

```js
showNotifyToast({
  title: 'Action',
  description: 'Click the button',
  type: 'action',
  button: {
    title: 'Accept',
    onClick: () => alert('Accepted!'),
  },
  fill: '#e0f7fa',
  roundness: 20,
  duration: 4000,
})
```
