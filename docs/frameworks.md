# Framework integrations

`@samline/notify` is a vanilla DOM package. It exports no React component, Vue plugin, or Svelte component; `Toaster` is a function alias of `createToaster()`.

Import CSS once, mount one singleton from client lifecycle code, and call `toast.*` from normal application code.

## React

```tsx
useEffect(() => {
  createToaster({ position: 'bottom-right' })
  return () => destroyToaster()
}, [])
```

Mount this once near the client root. React Strict Mode can repeat the development setup/cleanup cycle; avoid placing it in multiple layout branches.

## Vue

```ts
onMounted(() => createToaster())
onUnmounted(() => destroyToaster())
```

## Svelte

```ts
onMount(() => {
  createToaster()
  return destroyToaster
})
```

## SSR and hydration

Root and browser-registry imports are safe without a DOM. Mounting is not: `createToaster()` requires a ready `document.body`, and `mountToaster()` requires an explicit DOM root. Do not create toast state during server rendering or share it between requests.

## One renderer by default

Direct `mountToaster()` calls subscribe to global `ToastState` unless advanced code injects another state. Multiple default mounts can duplicate notifications and callbacks. Use the singleton lifecycle for normal integrations.

See [Getting started](getting-started.md), [Browser](browser.md), and [Troubleshooting](troubleshooting.md).
