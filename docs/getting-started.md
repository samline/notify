# Getting started

This page walks through what `@samline/notify` is, how the runtime is wired, and which side effects each public method produces. Use it as the mental model before you dive into the per-method reference under [`docs/api/`](api/index.md).

---

## When to use this variant

Use the vanilla variant when you work with native HTML pages, embedded scripts, static sites, or applications where you do not need a framework wrapper. This is the primary — and only — runtime entrypoint of `@samline/notify` since v3.0.0. (Patch releases like v3.0.1 are API-compatible.)

If you want a `<script>`-only setup without a bundler, see [docs/browser.md](browser.md).

---

## Anatomy of the runtime

The runtime has three moving parts:

1. **A module-level `Observer`** (`src/core/state.ts`) — keeps an array of toasts and a `Set` of dismissed ids, and notifies subscribers on every change. There is exactly one instance shared by every consumer in the page.
2. **A toaster controller** (`src/core/renderer.ts`) — produced by `createToaster()`. It builds a single `<ol data-notify-toaster>` on the page, subscribes to the `Observer`, and reconciles a `<li data-notify-toast>` per active toast id.
3. **The `toast` factory** (`src/api/toast.ts`) — the public surface that the rest of your code talks to. `toast(message, options?)` and its variants just push entries into the `Observer`; the renderer re-renders the DOM.

The controller is returned with a small, focused method surface. Most methods on it are chainable and return the same instance so you can compose setup fluently.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

const toaster = createToaster({ position: 'bottom-right', richColors: true })

toaster.update({ duration: 5000 }) // bump the auto-dismiss to 5s
toaster.destroy()                  // unmount
```

Methods that return data instead of the controller: `toaster.options`, `toast.getHistory()`, `toast.getToasts()`, `toast.dismiss(id)`.

---

## Observable contract

Once a toaster is mounted, you can rely on the following behaviour:

- **A `<ol data-notify-toaster>` exists on the page** with the data-attributes the stylesheet expects (`data-x-position`, `data-y-position`, `data-notify-theme`, `data-rich-colors`, `data-lifted`).
- **A `<li data-notify-toast data-id="<id>">` is rendered for every active toast** with its own data-attribute contract (`data-type`, `data-styled`, `data-mounted`, `data-visible`, `data-front`, `data-expanded`, `data-removed`, etc.).
- **Auto-dismiss runs on a per-toast `setTimeout`** at the toast's `duration` (default 4000 ms). Hovering a toast pauses the timer; moving out restarts it. Loading toasts and `toast.promise()` toasts are not auto-dismissed.
- **Swipe-to-dismiss is supported for corner positions** (`top-left`, `top-right`, `bottom-left`, `bottom-right`) via `pointerdown` / `pointermove` / `pointerup`. Centered positions are not swipeable.
- **`document.visibilitychange` pauses every active timer** while the tab is hidden, and restarts them when the tab becomes visible again.
- **Same-id updates re-render the DOM in place.** Calling `toast.loading('A', { id: 'x' })` then `toast.success('B', { id: 'x' })` updates the existing `<li>` instead of stacking a second one. The renderer fingerprints the content and re-fills only when `type`, `title`, `description`, `action`, or `cancel` changed.
- **`prefers-reduced-motion` is honored in CSS.** The JS still schedules timeouts but the stylesheet suppresses the animation/transition.

---

## Lifecycle

The recommended flow:

1. **Mount** — call [`createToaster(options?)`](api/create-toaster.md) once at app entry. It mounts the singleton controller, applies the data-attributes, and applies the CSS variables the stylesheet reads.
2. **Toast** — call [`toast(message, options?)`](api/toast.md) (or one of its variants) anywhere in your app. The toast is added to the `Observer`; the controller renders a `<li>` on the next event-loop tick.
3. **Update** — call `toaster.update(options?)` to re-render the container with new options. Useful for live theme or position changes.
4. **Resolve promises** — `toast.promise(promise, { loading, success, error })` ties a loading → success/error transition to a real `Promise`, reusing the same id.
5. **Dismiss** — toasts auto-dismiss after their `duration`. Call `toast.dismiss(id)` (or `toast.dismiss()` to drop them all) to dismiss early.
6. **Destroy** — call [`destroyToaster()`](api/destroy-toaster.md) (or `toaster.destroy()`) to unmount the container, clear every timer, and drop every active toast.

---

## Side effects per method

Use this as a quick lookup when you need to know what a method will touch.

| Method | DOM mutation | Timers scheduled | Subscribers notified | Toaster state touched |
| --- | --- | --- | --- | --- |
| [`toast`](api/toast.md) | yes (adds a `<li>`) | yes (auto-dismiss) | yes | none |
| [`toast.success` / `error` / `info` / `warning` / `loading` / `message`](api/toast.md#toastvariants) | yes (adds a `<li>`) | yes (no timer for `loading`) | yes | none |
| [`toast.promise`](api/toast.md#toastpromise) | yes (adds a loading `<li>`, then updates in place) | no on the loading variant | yes (twice on settle) | none |
| [`toast.custom`](api/toast.md#toastcustom) | yes (mounts the provided `HTMLElement` or runs the callback) | yes (auto-dismiss) | yes | none |
| [`toast.dismiss`](api/toast.md#toastdismiss) | yes (marks `data-removed`; removes `<li>` after `TIME_BEFORE_UNMOUNT`) | yes (clears pending timer) | yes | none |
| [`toast.getHistory`](api/toast.md#toastgethistory) / [`toast.getToasts`](api/toast.md#toastgettoasts) | no | no | no | none |
| [`createToaster`](api/create-toaster.md) | yes (mounts `<ol>`; appends to `document.body`) | no | no (subscribes once) | sets the singleton |
| [`createToaster`](api/create-toaster.md) (called twice) | updates the singleton in place via `update()` | restarted | no | updates the singleton |
| `toaster.update(options?)` | re-applies data-attributes and CSS variables | restarted | no | updates internal options |
| `toaster.destroy()` | removes the `<ol>` from the DOM | clears all timers | unsubscribes the renderer | clears the singleton |
| [`destroyToaster`](api/destroy-toaster.md) | same as `toaster.destroy()`, plus drops all toasts | clears all timers | yes (one per dropped toast) | clears the singleton |
| [`getToaster`](api/get-toaster.md) | no | no | no | none (read-only) |
| [`configureToaster`](api/configure-toaster.md) | same as `createToaster(options?)` | restarted | no | updates the singleton |
| [`resetToasts`](api/reset-toasts.md) | yes (drops all `<li>`s) | clears all timers | yes | none |

---

## Recommended usage patterns

- Use [`toast.promise`](api/toast.md#toastpromise) for any async flow that already returns a `Promise` — it ties loading/success/error to one id and updates the DOM in place.
- Use the `action` and `cancel` options for undo/redo flows; both default to closing the toast on click.
- Use [`toast.custom(element | (container) => void)`](api/toast.md#toastcustom) for rich content. Pass a pre-built `HTMLElement` you own, or a callback that fills a container. No JSX, no React nodes, no `innerHTML` of user input.
- For themes, override the `--normal-bg` / `--normal-text` / `--normal-border` / `--success-bg` / etc. CSS variables on `[data-notify-toaster][data-notify-theme="<theme>"]` — see [CSS styling](css-styling.md).
- Call `toaster.update({ position, theme, dir })` to react to live changes (e.g. when the user toggles dark mode).
- Call `toaster.destroy()` whenever a toaster is mounted and unmounted dynamically (SPA route changes, conditional rendering, modals). [`destroyToaster()`](api/destroy-toaster.md) is a no-op if none is mounted.

---

## Browser registry helpers

The browser IIFE bundle ships a single global (`window.Notify`) that wraps `toast` + `createToaster` + `getToaster` + `destroyToaster` + `configureToaster`. The same shape is available from the vanilla entrypoint as a module-level singleton called `browser`:

```ts
import { browser } from '@samline/notify'
import '@samline/notify/styles.css'

window.MyNotify = { ...browser }

window.MyNotify.createToaster({ position: 'bottom-right' })
window.MyNotify.toast.success('Saved')
window.MyNotify.destroyToaster()
```

`browser` is an object you can spread into your own globals or use directly. Because it shares the same module-level `Observer` and the same toaster singleton as the named exports, every spread behaves the same — `window.MyNotify.createToaster({})` and `createToaster({})` end up calling the same factory and updating the same DOM container.

If you need multiple independent singletons, use the `mountToaster(root, options?)` escape hatch and keep your own map of controllers.

```ts
import { mountToaster } from '@samline/notify'

const left = mountToaster(document.body, { position: 'bottom-left' })
const right = mountToaster(document.body, { position: 'bottom-right' })

// left and right have their own <ol> + timers + cleanups.
left.destroy()
right.destroy()
```

`mountToaster` accepts the DOM `root` (the `<ol>` will be appended to it), the `ToasterOptions`, and an optional `state` parameter for tests that need a fresh `Observer`. Use the named exports (`createToaster`, `getToaster`, `destroyToaster`) for the common case of one toaster per page.

---

## Submission examples

### `toast.promise` with `fetch`

```ts
import { toast } from '@samline/notify'

async function saveProfile(patch: object) {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  })

  if (!response.ok) {
    throw new Error(`Profile save failed: ${response.status}`)
  }

  return response.json()
}

toast.promise(saveProfile({ name: 'Sam' }), {
  loading: 'Saving profile…',
  success: (profile) => `Saved as ${profile.name}`,
  error: 'Could not save your profile'
})
```

The `loading` toast appears immediately, the same `<li>` updates in place to `success` or `error` once the promise settles, and the id you get back is the same for both phases. If you only want to read the result and toast yourself, drop the `loading` key — only the settled toast renders.

---

## Next steps

- Need a full options reference? See [docs/options.md](options.md).
- Looking up the exact signature of a method? See [docs/api/index.md](api/index.md).
- Working with the type system? See [docs/typescript.md](typescript.md).
- Want end-to-end patterns? See [docs/recipes.md](recipes.md).
- Want the stylesheet contract? See [docs/css-styling.md](css-styling.md).
- Working with the IIFE bundle? See [docs/browser.md](browser.md).
