# Vue

Use the Vue entry when you want a component-first API with a shared runtime.

## Install

```bash
bun add @samline/notify vue
```

## Basic usage

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { NotifyPlugin } from '@samline/notify/vue'

createApp(App).use(NotifyPlugin).mount('#app')
```

```vue
<script setup lang="ts">
import { Toaster, toast } from '@samline/notify/vue'
</script>

<template>
  <Toaster position="bottom-right" richColors />
  <button @click="() => toast('Hello from Vue')">Toast</button>
</template>
```

## Complete example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Toaster, toast } from '@samline/notify/vue'

const saving = ref(false)

async function saveSettings() {
  saving.value = true

  try {
    await toast.promise(
      fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ theme: 'dark' })
      }).then((response) => response.json()),
      {
        loading: 'Saving settings...',
        success: 'Settings saved',
        error: 'Could not save settings'
      }
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Toaster id="app-toaster" position="bottom-right" richColors closeButton :visibleToasts="4" :offset="24" />

  <button :disabled="saving" @click="saveSettings">
    {{ saving ? 'Saving...' : 'Save settings' }}
  </button>
</template>
```

## Plugin behavior

`NotifyPlugin` does three things:

1. Registers the toaster component as `NotifyToaster`.
2. Exposes `toast` on `app.config.globalProperties.$toast`.
3. Provides the toast function under the `notify:toast` injection key.

## Customization

The Vue toaster accepts the shared toaster options from [api.md](api.md).

Good defaults to start with:

```ts
createToaster({
  position: 'top-right',
  theme: 'system',
  gap: 14,
  visibleToasts: 4
})
```
