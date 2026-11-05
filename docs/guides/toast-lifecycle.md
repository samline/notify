# Toast lifecycle

A toast is a state record observed by a mounted renderer. Keeping those two pieces separate explains most Notify behavior: `toast.*` publishes state, while `createToaster()` gives that state somewhere to render.

## The complete flow

1. **Mount one renderer.**

   ```ts
   import { createToaster } from '@samline/notify'
   import '@samline/notify/styles.css'

   const toaster = createToaster({ position: 'bottom-right' })
   ```

   Repeating `createToaster()` updates the singleton. It does not append another container.

2. **Create a state record.**

   ```ts
   import { toast } from '@samline/notify'

   const id = toast.loading('Uploading invoice')
   ```

   The returned `ToastId` identifies the record. Loading toasts do not start an auto-dismiss timer.

3. **Update it in place.**

   ```ts
   toast.success('Invoice uploaded', { id, duration: 6000 })
   ```

   Reusing the id replaces the existing state record and DOM content. The success state starts its own timer.

4. **Pause, resume, or dismiss.**

   Hovering or focusing pauses the timer and preserves its remaining duration. The timer resumes when interaction ends. Close, keyboard, swipe, action, or `toast.dismiss(id)` can publish dismissal.

5. **Remove after the exit state.**

   Dismissal marks the rendered item as removed before DOM cleanup. The record leaves the active snapshot but stays in history until reset.

## Active state versus history

```ts
const visibleCandidates = toast.getToasts()
const allCurrentRecords = toast.getHistory()
```

Both methods return defensive snapshots. `getToasts()` excludes dismissed records; `getHistory()` includes them, keeping the newest 50 dismissed records (`HISTORY_LIMIT`). Updating an id replaces its record rather than appending another history entry.

Both snapshots are clones: the array, each record, and nested `action` and `cancel` objects are copied. Callback functions, promise objects, and DOM references stay the same references.

## Reset versus teardown

| Operation           | Clears toast records           | Keeps renderer subscribed      | Removes container |
| ------------------- | ------------------------------ | ------------------------------ | ----------------- |
| `toast.dismiss()`   | no; records remain in history  | yes                            | no                |
| `resetToasts()`     | yes; also resets generated ids | yes                            | no                |
| `destroyToaster()`  | no                             | no                             | yes               |
| `resetToastState()` | yes                            | **no**; drops every subscriber | no                |

**Prefer resetToasts() in tests**

`resetToasts()` clears the records, the dismissed ids, and the generated-id counter while keeping
the mounted renderer subscribed, so the next toast still renders. `resetToastState()` is a
low-level escape hatch: it drops every subscriber, so existing containers become stale and must be
destroyed and remounted.

## Timers that pause

The auto-dismiss timer is per toast and starts at the toast's resolved duration. Three things pause it:

- pointer or keyboard focus entering the toast,
- the page becoming hidden, through the `visibilitychange` event,
- the toast type being `loading`, which never schedules a timer at all.

The remaining time is preserved across a pause, so a toast that is focused halfway through its lifetime still gets the rest of its original duration.

## Avoid duplicate renderers

`mountToaster(root)` is advanced and subscribes to the shared global state by default. Two direct mounts can render every notification twice and invoke dismissal callbacks twice. Use the `createToaster()` singleton unless you are deliberately supplying isolated state.

## Related

- [Promise API](../promises.md)
- [API reference](../api/index.md)
- [Troubleshooting](../troubleshooting.md)
