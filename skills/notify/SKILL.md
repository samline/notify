---
name: notify
description: Integrate @samline/notify toast notifications into JavaScript, TypeScript, framework or CMS applications, including async feedback, actions, custom DOM and lifecycle cleanup.
---

# Integrate Notify

Use the package's public API and stylesheet. This skill describes **4.0.0**. Check the installed version; 3.x differs in global shape, `onDismiss` dispatch and custom-content DOM.

## Start with one owner

```ts
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

const toaster = createToaster({ richColors: true, closeButton: true })
toast.success('Changes saved')
// During application teardown:
destroyToaster()
```

Mount after document.body exists, once near the client root. Root/module imports are safe without a DOM but mounting is client-only. Never create request-specific toast state during SSR. React/Vue/Svelte use their client lifecycle; Astro client navigation must clean up before swapping the owning page. Do not mount a toaster in every button or competing layout branch.

Calling createToaster again updates the singleton. Keep the controller for update(options); omitted options remain unchanged. controller.destroy removes that renderer; destroyToaster also publishes global dismissals. Direct mountToaster calls share state by default, so separate containers are not independent channels.

## Script tags

Load matching CSS and standalone JavaScript from the published dist paths, in order, then use the registry:

```js
const notify = window.Notify
notify.toast.success('Changes saved')
```

`window.Notify` is the registry (3.2.0 and earlier wrapped it in a namespace; resolve `window.Notify.default ?? window.Notify` there). The /browser module entry does not install a global or auto-mount. The standalone script auto-mounts once; after destruction, remount explicitly.

## Match feedback to the task

- Reuse a toast id for progress and the terminal state. Loading has no automatic timer.
- toast.promise returns an object with unwrap(), and an id when loading was supplied. unwrap preserves the input outcome; a fulfilled non-ok HTTP response can show error while still fulfilling. Supplied thunks run immediately when data is present, without waiting for a paint.
- Dismissal, reset, teardown and same-id replacement invalidate late promise results. This does not cancel the underlying request. Keep network cancellation in the application.
- Use action/cancel for short optional next steps. They close by default; closeOnClick:false keeps the toast available. Make Undo change the actual application state rather than just report success.
- Custom content uses safe DOM construction. It mounts inside div[data-custom], is unstyled and gets no generated close button. Supply readable labels, visible focus and a real dismissal control.
- For persistent notifications, duration:Infinity needs an accessible way to close. Keep required actions and critical errors in persistent page UI as well.

## Preserve ownership and accessibility

The package owns rendering, timers, swipe, focus-paused timing and polite announcements. Keyboard focus expands the stack, edit keys stay with editable controls, and changing position refreshes gesture eligibility. Consumers own wording, contrast, timing and custom controls. Centered positions swipe vertically. Respect reduced motion; it does not extend reading time.

Use resetToasts for test cleanup that preserves render subscriptions. resetToastState also drops subscribers and leaves existing containers stale. History is a snapshot of the latest record per id, not an append-only event log. getToasts excludes dismissed records.

For complete contracts and runnable files, use https://samline.github.io/notify/docs/ and https://samline.github.io/notify/examples/. When working in the source repository, docs/ is the canonical Markdown and site/documentation-map.json records its generated website destinations. This skill teaches package integration; it does not authorize publishing or changing an application's design.

## Compose useful interactions

Use `action` plus `cancel` for a lightweight optional choice; `closeOnClick: false` allows a review step to update the same id into a decision step. Required decisions still belong in persistent UI or a dialog.

Use `unwrap()` to put an actual promise result in the page. Own an AbortController when work can be canceled, and restore controls in `finally`. Keep network failures, canceled work and successful results distinct.

A custom content factory may run again when rendered dependencies change. Preserve the draft outside the factory, abort the previous render's listeners before rebuilding, and dispose those listeners on dismissal and integration teardown. Do not attach every replacement DOM node to an application-lifetime AbortSignal.

Use `style: { '--width': '24rem' }` for custom width. Use the numeric `gap` option and offset options for measured geometry. Keep long-form, blocking or essential controls out of transient notifications.
