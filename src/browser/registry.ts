// Browser-side singleton registry. Same shape as the IIFE bundle's
// `Notify` global, but importable from any bundler. Consumers can
// spread it into their own globals or use it directly.

import { configureToaster } from '../api/configure-toaster'
import { createToaster } from '../api/create-toaster'
import { destroyToaster } from '../api/destroy-toaster'
import { getToaster } from '../api/get-toaster'
import { toast } from '../api/toast'
import type { ToasterController, ToasterOptions } from '../core/types'

export interface NotifyApi {
  toast: typeof toast
  Toaster: (options?: ToasterOptions) => ToasterController
  createToaster: (options?: ToasterOptions) => ToasterController
  configureToaster: (options?: ToasterOptions) => ToasterController
  getToaster: () => ToasterController | null
  destroyToaster: () => void
}

export const browser: NotifyApi = {
  toast,
  Toaster: createToaster,
  createToaster,
  configureToaster,
  getToaster,
  destroyToaster
}
