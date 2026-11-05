# Troubleshooting guide

## Toasts do not appear

Confirm that a toaster is mounted:

```ts
import { createToaster, getToaster } from '@samline/notify'

if (!getToaster()) createToaster()
```

`toast.*` updates the state even when no renderer exists, so the state is correct but nothing is on screen. If a toaster was destroyed, it does not auto-remount. Call `createToaster()` again.

## `document.body` error

`createToaster()` throws before `document.body` exists. Use a module loaded after the body, `DOMContentLoaded`, or your framework's client mount hook.

```js
document.addEventListener(
  'DOMContentLoaded',
  () => {
    const notify = window.Notify.default ?? window.Notify
    notify.createToaster()
  },
  { once: true }
)
```

The standalone build already handles this for its own first automatic mount.

## Toasts look like a plain list

Import `@samline/notify/styles.css` in a bundled client entry, or link `dist/styles.css` for the standalone build. Make sure the CSS version matches the JavaScript version, and inspect the network response for a 404 or an HTML fallback page.

## Duplicate notifications or callbacks

Look for multiple `mountToaster()` calls, or framework effects mounted in more than one root. Direct mounts share the global `ToastState` and receive the same events, so each renderer displays the toast. `onDismiss` still runs once, from the shared state.

Repeated `createToaster()` calls alone do not create duplicates. They update the same registered controller.

## SSR failures

Imports are safe, but mounting requires the browser. Move `createToaster()` or `mountToaster()` out of module scope and into a client lifecycle. Do not create toast state during server rendering, and never share that state between requests.

## The CDN global is undefined

- Open the exact standalone URL and verify it returns JavaScript.
- Put your own script after a synchronous standalone script at the end of the body.
- If the external script uses `defer`, wait for `DOMContentLoaded`. A following classic inline script is not deferred automatically.
- Check the Content Security Policy and the browser console.
- Pin a published version instead of assuming the repository version is already on the CDN.

## Assets fail under a base path

Use absolute CDN URLs, or include the application's public base in self-hosted paths. On a site hosted under `/my-app/`, `/vendor/notify.js` and `/my-app/vendor/notify.js` are different URLs. Verify the script and CSS URLs independently.

## Teardown and remount

`destroyToaster()` publishes dismissals while the renderer is still subscribed, removes the singleton container, and clears the registry. `controller.destroy()` removes that controller and clears the registry when it is the current singleton, but it does not publish dismissals itself.

```ts
destroyToaster()

// Required before later notifications can render.
createToaster({ position: 'bottom-right' })
toast.info('Mounted again')
```

`resetToasts()` is different: it clears the active records, the history, and the generated-id counter while preserving the mounted subscribers. `resetToastState()` drops subscribers and leaves mounted containers stale, so advanced callers must destroy and remount afterwards.

## Strict Content Security Policy or custom visuals

The renderer writes inline layout and custom-property declarations. A policy that blocks style attributes can break positioning even when the stylesheet loads. Adjust the policy for the application, or build a controlled advanced renderer integration.

`unstyled: true` disables the built-in toast-body presentation, not the renderer layout styles. When supplying your own visuals, preserve focus indicators, contrast, responsive width, reduced motion, and button target sizes.

## Callbacks run more than once

Dismissal is de-duplicated by id in the shared state, and `onDismiss` runs once per toast regardless of how many renderers are mounted. If you still see repeated side effects, look for duplicate mounts rendering the same toast twice. Also make sure your own application callbacks do not register the same side effect repeatedly during framework development lifecycles.

## Framework migration

If you are migrating from a framework wrapper, replace the component or plugin with one client lifecycle call to `createToaster()`, import the stylesheet once, and keep the `toast.*` calls in ordinary application code. Do not render a `Toaster` component: this package's `Toaster` export is a function alias, not a component.

## Related

- [Entrypoints](entrypoints.md)
- [CSS styling](css-styling.md)
- [Framework integrations](frameworks.md)
