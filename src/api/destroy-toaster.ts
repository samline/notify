// `destroyToaster()` — unmount the singleton toaster instance created
// by `createToaster()`. No-op if none is mounted.

import { toast } from './toast'
import { clearToaster, getToasterInstance } from './toaster-instance'

export function destroyToaster(): void {
  const current = getToasterInstance()
  if (!current) return
  current.destroy()
  clearToaster()
  // Drop all in-flight toasts so a future `createToaster()` starts fresh.
  toast.dismiss()
}
