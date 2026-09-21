// `destroyToaster()` — unmount the singleton toaster instance created
// by `createToaster()`. No-op if none is mounted.

import { toast } from './toast'
import { clearToaster, getToasterInstance } from './toaster-instance'

export function destroyToaster(): void {
  const current = getToasterInstance()
  if (!current) return
  // Publish dismissal events while the renderer is still subscribed so
  // lifecycle callbacks run before the singleton is unmounted.
  toast.dismiss()
  current.destroy()
  clearToaster()
}
