---
title: Framework integrations
description: Use the vanilla Notify controller safely from React, Vue, Svelte, and server-rendered applications.
template: doc
sidebar:
  order: 9
---

`@samline/notify` is a vanilla DOM package. It does not export a React component, Vue plugin, Svelte component, or framework-specific context. `Toaster` is a function alias of `createToaster()`.

Import the stylesheet once, mount the singleton from client lifecycle code, and use the exported `toast` object from event handlers or application services.

## React

```tsx
import { useEffect } from 'react'
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

export function Notifications() {
  useEffect(() => {
    createToaster({ position: 'bottom-right' })
    return () => destroyToaster()
  }, [])

  return (
    <button type="button" onClick={() => toast.success('Saved')}>
      Save
    </button>
  )
}
```

Mount this integration once near the client root. React Strict Mode may run the development effect setup/cleanup cycle more than once; the singleton creation and destruction are safe, but destruction publishes dismissals. Avoid mounting the effect in multiple layout branches.

## Vue

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

onMounted(() => createToaster({ position: 'bottom-right' }))
onUnmounted(() => destroyToaster())

function save() {
  toast.success('Saved')
}
</script>

<template>
  <button type="button" @click="save">Save</button>
</template>
```

Use a single root/layout component rather than installing one toaster per view.

## Svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { createToaster, destroyToaster, toast } from '@samline/notify'
  import '@samline/notify/styles.css'

  onMount(() => {
    createToaster({ position: 'bottom-right' })
    return destroyToaster
  })
</script>

<button type="button" onclick={() => toast.success('Saved')}>Save</button>
```

`onMount` does not run during server rendering, which keeps DOM mounting on the client.

## SSR and hydration

Root and browser-registry imports are SSR-safe. Mounting is not: `createToaster()` requires a DOM and a ready `document.body`; `mountToaster()` requires a DOM and an explicit root.

For Astro, Next.js, Nuxt, SvelteKit, and similar systems:

- import CSS through the framework's supported client/global stylesheet path;
- call `createToaster()` in client-only lifecycle code;
- avoid calling `toast.*` during server rendering, because state created on the server has no client renderer and should not be shared between requests;
- destroy only when the application actually tears down the integration, then remount explicitly if client navigation needs it again.

## Shared state, not channels

Do not create one direct mount per framework subtree. `mountToaster()` defaults to global `ToastState`; every such renderer receives the same events and can display duplicates. The legacy `id`/`toasterId` filter does not isolate state, history, counters, or subscriptions and should not be treated as framework routing.

If an application truly needs independently owned notification systems, use separate package instances/build contexts or an advanced injected state design rather than multiple default mounts.
