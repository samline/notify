// `resetToasts()` — drop every toast (active and dismissed) and
// rewind the internal counter. Intended for tests and dev tooling;
// in production it's a quick way to clear the screen.

import { resetToastState, ToastState } from '../core/state'

export function resetToasts(): void {
  ToastState.dismiss()
  const subscribers = ToastState.subscribers
  resetToastState()
  ToastState.subscribers = subscribers
}

export { ToastState }
