# Notify - Vue 3

## Installation

```bash
npm install @samline/notify/vue
```

## Basic usage

```js
import { showNotifyToast, useNotifyToasts } from '@samline/notify/vue'

showNotifyToast({ title: 'Hello Vue', type: 'info' })

// In a component:
const { toasts } = useNotifyToasts()
```

### UI Plug-and-play

```vue
<template>
  <NotifyToasts />
</template>
<script setup>
import NotifyToasts from '@samline/notify/vue'
</script>
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
