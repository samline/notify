import type { Position } from '../types'

export type ToastId = number | string

export type CommonToastType = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default'

export type CommonRenderable = boolean | number | string | null | undefined

export type CommonPromise<Data = unknown> = Promise<Data> | (() => Promise<Data>)

export interface CommonToastAction {
  label: CommonRenderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}

export interface CommonToastPayload {
  id: ToastId
  toasterId?: string
  title?: CommonRenderable
  description?: CommonRenderable
  type?: CommonToastType
  richColors?: boolean
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  position?: Position
  testId?: string
  action?: CommonToastAction
  cancel?: CommonToastAction
}

export type CommonToastOptions = Omit<CommonToastPayload, 'id'> & {
  id?: ToastId
}

export interface CommonPromiseResult extends CommonToastOptions {
  message: CommonRenderable
}

export type CommonPromiseValue<Data = unknown> =
  | CommonRenderable
  | CommonPromiseResult
  | ((data: Data) => CommonRenderable | CommonPromiseResult | Promise<CommonRenderable | CommonPromiseResult>)

export type CommonOffset =
  | {
      top?: number | string
      right?: number | string
      bottom?: number | string
      left?: number | string
    }
  | number
  | string

export interface CommonToasterOptions {
  id?: string
  theme?: 'light' | 'dark' | 'system'
  position?: Position
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  className?: string
  offset?: CommonOffset
  mobileOffset?: CommonOffset
  dir?: 'rtl' | 'ltr' | 'auto'
  richColors?: boolean
  customAriaLabel?: string
  containerAriaLabel?: string
}

export interface CommonPromiseData<Data = unknown> extends Omit<CommonToastOptions, 'description'> {
  loading?: CommonRenderable
  success?: CommonPromiseValue<Data>
  error?: CommonPromiseValue
  description?: CommonRenderable | ((data: Data | unknown) => CommonRenderable | Promise<CommonRenderable>)
  finally?: () => void | Promise<void>
}
