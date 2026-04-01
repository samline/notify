# API Reference

`@samline/sonner` is a toast package inspired by [Sonner](https://github.com/emilkowalski/sonner). The goal here is to complement that idea and experiment with a shared runtime that works across React, Vue, Svelte, vanilla JS, and browser/CDN usage.

## Package Surface

| Entry point | Purpose |
| --- | --- |
| `@samline/sonner` | Main vanilla/browser API |
| `@samline/sonner/browser` | Browser global entry that exposes `window.Sonner` |
| `@samline/sonner/react` | React adapter |
| `@samline/sonner/vue` | Vue adapter |
| `@samline/sonner/svelte` | Svelte adapter |
| `@samline/sonner/styles.css` | Shared styles export |

## Shared Concepts

The package is split into three layers:

1. Shared runtime and state.
2. Framework adapters.
3. A browser entry for direct usage without a framework.

All entrypoints share the same toast state, the same queue behavior, and the same visual styling.

### Toast types

The public toast methods support these types:

- `normal`
- `action`
- `success`
- `info`
- `warning`
- `error`
- `loading`
- `default`

### Renderable values

Most text-like values accept primitives that can be rendered directly:

- `string`
- `number`
- `boolean`
- `null`
- `undefined`

The framework adapters widen those values to the framework's native renderable type.

### Actions

Actions are shaped like:

```ts
{
  label: string | number | boolean | null | undefined
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}
```

Use them for an action button or a cancel button in a toast.

## Vanilla and Browser API

The root entry and the browser entry expose the same core API:

- `toast`
- `createToaster(options?)`
- `configureToaster(options?)`
- `getToaster()`
- `destroyToaster()`
- `Toaster`

### `toast(message, options?)`

Creates a toast. The returned identifier can be used later to dismiss or update the same toast.

```ts
toast('Saved')
toast('Updated', { id: 'save-status' })
toast.dismiss('save-status')
```

### `toast.success`, `toast.info`, `toast.warning`, `toast.error`, `toast.loading`, `toast.message`

Convenience variants for common states.

```ts
toast.success('Profile updated')
toast.error('Something went wrong', { description: 'Try again in a moment' })
```

### `toast.promise(promise, data?)`

Shows a loading state and swaps it for a success or error message.

```ts
toast.promise(saveProfile(), {
  loading: 'Saving profile...',
  success: 'Profile saved',
  error: 'Could not save profile',
})
```

The `success`, `error`, and `description` fields can be values or callbacks that receive the resolved value or error data.

### `toast.dismiss(id?)`

Dismisses one toast or all toasts when called without an id.

### `toast.getHistory()` and `toast.getToasts()`

Read the current toast state for debugging, testing, or building custom integrations.

### `createToaster(options?)`

Creates or updates the shared toaster mount in the DOM.

```ts
const controller = createToaster({ position: 'bottom-right', richColors: true })

controller.update({ duration: 5000 })
controller.destroy()
```

### `configureToaster(options?)`

Alias of `createToaster`. Use whichever name reads better in your codebase.

### `getToaster()`

Returns the current controller when the toaster is mounted.

### `destroyToaster()`

Unmounts the shared toaster and removes the mounted container from the document.

## Shared Toaster Options

These options are accepted by the vanilla, browser, Vue, and Svelte entrypoints.

| Option | Type | Purpose |
| --- | --- | --- |
| `id` | string | Optional toaster instance id |
| `theme` | `light` / `dark` / `system` | Color mode |
| `position` | top-left, top-right, bottom-left, bottom-right, top-center, bottom-center | Screen placement |
| `expand` | boolean | Expand stacked toasts |
| `duration` | number | Default auto-dismiss duration |
| `gap` | number | Spacing between toasts |
| `visibleToasts` | number | Maximum visible toasts |
| `closeButton` | boolean | Show the close button |
| `className` | string | Class applied to the toaster root |
| `offset` | number, string, or object | Desktop offset |
| `mobileOffset` | number, string, or object | Mobile offset |
| `dir` | `rtl` / `ltr` / `auto` | Text direction |
| `richColors` | boolean | Use saturated colors for status variants |
| `customAriaLabel` | string | Accessible label for the wrapper |
| `containerAriaLabel` | string | Accessible label for the container |

### Example

```ts
createToaster({
  position: 'bottom-right',
  duration: 4000,
  richColors: true,
  closeButton: true,
  offset: 24,
})
```

## React API

The React entry adds two things on top of the shared toast methods:

- `Toaster` component
- `useSonner` hook

### `Toaster` props

The React toaster supports the shared options plus these React-specific props:

- `hotkey`
- `toastOptions`
- `style`
- `swipeDirections`
- `icons`

### `toastOptions`

Use `toastOptions` to set default styles and behavior for every toast rendered by that toaster.

### `icons`

Override the built-in icons for success, info, warning, error, loading, or close.

## Vue API

The Vue entry exports:

- `Toaster`
- `SonnerPlugin`
- `toast`
- `createToaster`
- `destroyToaster`
- `getToaster`

`SonnerPlugin` registers the toaster component and exposes `toast` through the app instance and dependency injection.

## Svelte API

The Svelte entry exports:

- `toaster` action
- `Toaster` alias for the action
- `mountToaster`
- `toast`
- `createToaster`
- `destroyToaster`
- `getToaster`

Use the action when you want the shared toaster mounted from a Svelte component.

## Browser Global API

The browser entry exposes `window.Sonner` with this shape:

```ts
window.Sonner = {
  toast,
  Toaster,
  createToaster,
  configureToaster,
  getToaster,
  destroyToaster,
}
```

Importing the browser entry auto-mounts a toaster in the current document.

## Customization Tips

1. Use `theme`, `richColors`, and `closeButton` to tune the visual style.
2. Use `position`, `offset`, `mobileOffset`, and `visibleToasts` to control layout.
3. Use `duration` and `expand` to adjust motion and stack behavior.
4. Use `toast.promise` for async flows instead of manual loading/success/error chains.
5. Use `id` when you want to update an existing toast instead of spawning a new one.
