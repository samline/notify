import { createToaster, destroyToaster, getToaster, toast } from '../index'
import type { CommonToasterOptions } from '../core'

export type SvelteToasterOptions = CommonToasterOptions

function syncToaster(options?: SvelteToasterOptions) {
  createToaster(options ?? {})
}

export function toaster(node: HTMLElement, options?: SvelteToasterOptions) {
  node.dataset.notifySvelteToaster = ''
  node.hidden = true
  node.setAttribute('aria-hidden', 'true')

  syncToaster(options)

  return {
    update(nextOptions?: SvelteToasterOptions) {
      syncToaster(nextOptions)
    },
    destroy() {
      destroyToaster()
    }
  }
}

export const Toaster = toaster

export function mountToaster(options?: SvelteToasterOptions) {
  syncToaster(options)
  return getToaster()
}

export { createToaster, destroyToaster, getToaster, toast }
