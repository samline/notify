// Numeric defaults for the renderer. Ported 1:1 from the legacy
// `_runtime.ts` so existing CSS assumptions (gap, width, offsets,
// swipe threshold, unmount grace) all still hold.

// Visible toasts amount
export const VISIBLE_TOASTS_AMOUNT = 3

// Viewport padding
export const VIEWPORT_OFFSET = '24px'

// Mobile viewport padding
export const MOBILE_VIEWPORT_OFFSET = '16px'

// Default lifetime of a toast (in ms)
export const TOAST_LIFETIME = 4000

// Default toast width
export const TOAST_WIDTH = 356

// Default gap between toasts
export const GAP = 14

// Threshold to dismiss a toast
export const SWIPE_THRESHOLD = 45

// Equal to exit animation duration
export const TIME_BEFORE_UNMOUNT = 200
