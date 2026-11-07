# End-to-end examples

End-to-end patterns that combine multiple methods. Mount a toaster and load its stylesheet first. The complete file viewer is standalone; the shorter recipes continue an existing application integration.

## Try it

<!-- notify:playground -->

The live preview runs the package source. Each disclosure contains separate files and a complete document for package imports and the 4.0.0 CDN build.

## Explore the possibilities

Choose a task by the behavior you want to build, not the notification color:

| Task                      | What to try                                                | Capabilities composed                                                            |
| ------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Save a profile            | Change the name, save, then repeat                         | Loading → success on the same id; form feedback                                  |
| Recover delivery          | Fail once, then retry from the notification                | Persistent error, description and actionable recovery                            |
| Track an upload           | Watch one message update while progress advances           | Manual loading and same-id terminal update                                       |
| Undo an archive           | Remove an item, then restore the same item                 | State restoration from a toast action                                            |
| Keep an invitation        | Read at your own pace, then dismiss                        | Infinite duration and explicit close controls                                    |
| Write a release note      | Edit inside a custom card and save to the page             | Consumer DOM factory, styling and native form controls                           |
| Change preferences        | Change theme, direction and position while a toast is open | Partial controller updates, system theme and RTL                                 |
| Inspect activity          | Dismiss a record and compare active/history snapshots      | Lazy message factory and defensive state reads                                   |
| Review and decide         | Review access, then join or defer                          | action + cancel, closeOnClick: false and multi-step same-id content              |
| Follow workspace activity | Change visibility/expansion, focus, swipe or wait          | Normal and typed variants, stack geometry, paused timers and lifecycle callbacks |
| Export a report           | Succeed, fail, cancel, then view the CSV                   | Promise outcome, extended result action, unwrap, AbortController and finally     |

Every task below runs on the website with its code: open **Explore the code** to copy separate files or one complete document, for package imports and the CDN build. Keep important outcomes on the page as well as in the toast. The previews simulate local work; their messages do not claim a real save, invitation acceptance or server export.

### Error and retry

Send the October report. The first simulated request fails; retrying succeeds.

<!-- notify:playground retry -->

### Progress updates

Upload campaign-cover.jpg, a 2.4 MB sample asset. Progress is simulated locally.

<!-- notify:playground upload -->

### Undo archive

Archive the launch checklist. Use Undo in the notification to bring the same item back.

<!-- notify:playground undo -->

### Persistent notice

Keep an invitation notice open while you read. Its details also remain on the page.

<!-- notify:playground persistent -->

### Custom content

Open a release card, write a note inside the notification and save it back to the page. Your integration owns the DOM and appearance.

<!-- notify:playground custom -->

### Theme and position

Choose position, theme and reading direction. Preview the same notification, then apply changes while it is still open.

<!-- notify:playground position -->

### Active and history

Create a local activity entry, dismiss its notification, then compare the active state and history.

<!-- notify:playground history -->

### Review and decide

Review an Editor invitation to Studio. Read its permissions, then join or choose Not now. This is a local decision preview.

<!-- notify:playground decisions -->

### Live activity stack

Play a local sequence of uploads, comments and transfer alerts. The page retains the feed while notifications stack, expire or are dismissed.

<!-- notify:playground stream -->

### Cancelable CSV export

Generate a small CSV from local sample data. Try success, a simulated server error, or cancel the pending operation. No request leaves this page.

<!-- notify:playground task -->

The previews deliberately share one application-level toaster. The most recently used preview controls its global preferences. Use the preview reset to dismiss only its owned notifications; do not mount independent singleton owners for every application component.

Low-level `ToastState` subscriptions, injected state and direct mounts are module APIs for advanced integrations; they are documented below and in the API reference. They are not extra isolated channels or members of the standalone browser registry.

## 1. Minimal setup

### Bundler

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ richColors: true })
toast.success('Notify is ready')
```

### Browser global

```html
<button id="save" type="button">Save</button>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/notify@4.0.0/dist/styles.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/notify@4.0.0/dist/browser/global.global.js"></script>
<script>
  const notify = window.Notify

  document.querySelector('#save').addEventListener('click', () => {
    notify.toast.success('Saved')
  })
</script>
```

## 2. `toast.promise` with `fetch`

```ts
import { toast } from '@samline/notify'

async function saveProfile(patch: object): Promise<{ name: string }> {
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

toast.promise(saveProfile({ name: 'Nora' }), {
  loading: 'Saving profile…',
  success: (profile) => `Saved as ${profile.name}`,
  error: 'Could not save your profile'
})
```

The loading toast appears immediately. Once the promise settles, the same list item updates in place to the success or error type. The id returned by `toast.promise()` is the same id used for both phases.

If the resolved value is a response whose `ok` is `false`, the runtime routes to `error` automatically. Call toast.promise from the click or debounced callback when the work should start there; a supplied thunk runs immediately when data is supplied.

## 3. Undo with `action` and `cancel`

```ts
toast('Item deleted', {
  type: 'action',
  duration: 6000,
  action: {
    label: 'Undo',
    onClick: () => restoreItem(item)
  },
  cancel: {
    label: 'Dismiss',
    onClick: () => {}
  }
})
```

The toast renders two trailing buttons: `cancel` first, `action` second. Both close the toast on click by default. Set `closeOnClick: false` on either to keep the toast open while a follow-up action runs.

## 4. Rich content with `toast.custom`

```ts
toast.custom((container) => {
  const heading = document.createElement('strong')
  heading.textContent = 'Build complete'

  const detail = document.createElement('span')
  detail.textContent = ' Production assets are ready.'

  container.append(heading, detail)
})
```

The renderer creates a mount element for you and hands it to the callback. Append whatever DOM you own. Do not inject user-supplied HTML as `innerHTML`.

You can also pass a pre-built element:

```ts
const widget = document.createElement('div')
widget.textContent = 'Pre-built widget'

toast.custom(widget, { duration: 8000 })
```

## 5. Same-id updates in place

```ts
const id = toast.loading('Uploading…', { id: 'upload-1' })

await uploadFile(file)

toast.success('Upload complete', { id: 'upload-1' })
```

The second call updates the same list item in place. The runtime fingerprints the content and re-fills only when the type, title, description, action, or cancel changed. The auto-dismiss timer is also reset, so the toast stays visible for another full duration after the success message replaces the loading message.

This is the same mechanism `toast.promise` uses internally.

## 6. Live theme and position changes

```ts
import { createToaster, getToaster } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ theme: 'light', position: 'bottom-right' })

document.querySelector('#theme-toggle')?.addEventListener('click', () => {
  getToaster()?.update({ theme: 'dark' })
})
```

`toaster.update(options?)` re-applies the data attributes and the CSS variables. Omitted options keep their current value. Toasts already in flight keep their own type and mounted state.

## 7. Mobile offsets

```ts
createToaster({
  position: 'bottom-right',
  offset: 24,
  mobileOffset: 16
})
```

The runtime applies the mobile offset on coarse pointers. Pass an object to customize each side:

```ts
createToaster({
  offset: { top: 24, right: 24, bottom: 24, left: 24 },
  mobileOffset: { bottom: 80 } // account for an iOS bottom bar
})
```

Numbers become pixels. Strings such as `'2rem'` are used verbatim.

## 8. Multi-toaster interface

```ts
import { mountToaster } from '@samline/notify'
import '@samline/notify/styles.css'

const errors = mountToaster(document.body, {
  position: 'top-right',
  theme: 'dark',
  richColors: true,
  visibleToasts: 5
})

const banners = mountToaster(document.body, {
  position: 'bottom-left',
  duration: 6000
})

errors.element.dataset['notifyChannel'] = 'errors'
banners.element.dataset['notifyChannel'] = 'banners'
```

`mountToaster` accepts a root, the toaster options, and an optional state object for tests. The two toasters have separate containers and separate cleanup.

**Direct mounts share the global state**

Both mounts subscribe to the same global `ToastState`, so every published event reaches every
renderer. The legacy `id` and `toasterId` fields filter that shared stream; they do not create
isolated state, history, counters, or subscriptions. Keep one `createToaster()` singleton for
normal integrations.

## 9. Per-toast test hook

```ts
toast.success('Profile saved', { testId: 'profile-save-success' })
```

The runtime renders `data-testid="profile-save-success"` on the list item, so an end-to-end selector can target one specific toast.

## 10. Persist a toast log

```ts
import { toast, ToastState } from '@samline/notify'

ToastState.subscribe((event) => {
  if ('dismiss' in event) {
    logEvent('toast_dismissed', { id: event.id })
  } else {
    logEvent('toast_created', { id: event.id, type: event.type })
  }
})
```

The observer publishes on creation, update and dismissal. A typical toast.promise with loading and a defined settled message publishes loading and settlement; optional messages and later dismissal change the total event count. Subscribers run synchronously inside the publish call, so keep them fast and do not throw.

## 11. Custom CSS for the toaster

Use options for measured geometry and inline custom properties for a branded width and palette:

```ts
createToaster({
  gap: 12,
  offset: { bottom: 24 },
  mobileOffset: { bottom: 24 },
  style: { '--width': '24rem', '--normal-bg': '#fffdf8', '--normal-text': '#29231f' }
})
```

The `style` map can override the default `--width`. Gap and measured offsets belong to their options so JavaScript stack measurements and CSS agree. Add ordinary cosmetic rules after the package stylesheet, using matching scope and specificity:

```css
[data-notify-toaster][data-notify-theme='light'] {
  --success-bg: #ecfdf3;
  --success-text: #086c3c;
  --success-border: #a6e8c4;
  --border-radius: 10px;
}
```

## 12. Disable auto-dismiss for one toast

```ts
toast.info('Heads up — check the server status', { duration: Infinity })
```

`duration: Infinity` cancels the auto-dismiss. The user can still dismiss manually with the close button, when it is enabled, or by swiping, when the position allows it.

`toast.loading` and the loading state of `toast.promise` never schedule a timer by design.

## 13. SPA cleanup on route change

```ts
import { createToaster, destroyToaster } from '@samline/notify'

router.on('/profile', () => {
  createToaster({ position: 'bottom-right' })
})

router.off('/profile', () => {
  destroyToaster()
})
```

`destroyToaster()` is idempotent and a no-op when no toaster is mounted. If you used `mountToaster` for a multi-toaster interface, keep your own references and call `controller.destroy()` directly.

## 14. Read the current toasts

```ts
import { toast } from '@samline/notify'

const active = toast.getToasts()
// [{ id: 1, type: 'success', title: 'Saved', ... }, ...]

const history = toast.getHistory()
// the latest record for each id since the last reset, including dismissed records
```

`getToasts()` filters out the ids in the dismissed set. `getHistory()` returns the unfiltered list, capped at the newest 50 dismissed records. Both return defensive snapshots. Array and record changes stay local; callback functions, promises and custom DOM remain shared references.

## 15. Reset everything

```ts
import { resetToasts } from '@samline/notify'

resetToasts()
```

`resetToasts()` drops every toast, active and dismissed, and rewinds the generated-id counter. It keeps the mounted renderer subscribed. In production you usually want `toast.dismiss()`, which keeps the counter, or `destroyToaster()`, which also unmounts the container.

## Defensive snapshots

Arrays, each toast record, and nested action/cancel objects are cloned. Callback functions, promises, and custom DOM remain references. Mutating a snapshot does not update the runtime; reuse the id in a toast call instead.

```ts
import type { ToastT } from '@samline/notify'

const active: ToastT[] = toast.getToasts()
const history: ToastT[] = toast.getHistory()
active.splice(0)
const first = history[0]
if (first?.action) first.action.label = 'Local copy'
```

## Typed event subscriptions

```ts
import { ToastState } from '@samline/notify'
import type { ToastToDismiss } from '@samline/notify'

const unsubscribe = ToastState.subscribe((event) => {
  if ('dismiss' in event) {
    const dismissed: ToastToDismiss = event
    console.log('Dismissed', dismissed.id)
  } else {
    console.log('Created or updated', event.title)
  }
})
// During integration cleanup:
unsubscribe()
```

Subscribers run synchronously. Avoid throwing and keep work small; the first exception is rethrown after delivery to the other current subscribers.
