'use client'

import React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import { canUseDOM } from './_runtime'
import { toast as internalToast, ToastState } from './state'
import type {
  CommonPromiseData,
  CommonPromiseValue,
  CommonRenderable,
  CommonToasterOptions,
  CommonToastAction,
  CommonToastOptions
} from './core'
import { Toaster as ReactToaster } from './react/render'
import type { ExternalToast, ToasterProps } from './types'

export interface VanillaToasterController {
  element: HTMLElement
  update: (options?: CommonToasterOptions) => VanillaToasterController
  destroy: () => void
  options: CommonToasterOptions
}

let vanillaToasterRoot: Root | null = null
let vanillaToasterElement: HTMLElement | null = null
let vanillaToasterOptions: CommonToasterOptions = {}

function toReactAction(action?: CommonToastAction): ExternalToast['action'] | ExternalToast['cancel'] {
  if (!action) return undefined

  return {
    label: action.label as React.ReactNode,
    onClick: (event) => {
      action.onClick?.(event as unknown as Event)
      if (action.closeOnClick === false) {
        event.preventDefault()
      }
    }
  }
}

function normalizeToastOptions(options?: CommonToastOptions): ExternalToast | undefined {
  if (!options) return undefined

  return {
    ...options,
    action: toReactAction(options.action),
    cancel: toReactAction(options.cancel)
  } as ExternalToast
}

function normalizePromiseValue<Data>(value: CommonPromiseValue<Data> | undefined) {
  if (typeof value !== 'function') {
    return value as any
  }

  return async (data: Data) => value(data)
}

function normalizePromiseData<Data>(data?: CommonPromiseData<Data>) {
  if (!data) return undefined

  const { loading, success, error, description, finally: finallyCallback, ...rest } = data

  return {
    ...normalizeToastOptions(rest),
    loading: loading as React.ReactNode,
    success: normalizePromiseValue(success),
    error: normalizePromiseValue(error),
    description: description as any,
    finally: finallyCallback
  }
}

function getVanillaContainer() {
  if (!canUseDOM()) return null

  if (vanillaToasterElement?.isConnected) {
    return vanillaToasterElement
  }

  const existing = document.querySelector<HTMLElement>('[data-notify-vanilla-root]')
  if (existing) {
    vanillaToasterElement = existing
    return existing
  }

  const element = document.createElement('div')
  element.dataset.notifyVanillaRoot = ''
  document.body.appendChild(element)
  vanillaToasterElement = element
  return element
}

function renderVanillaToaster() {
  const container = getVanillaContainer()
  if (!container) return null

  if (!vanillaToasterRoot) {
    vanillaToasterRoot = createRoot(container)
  }

  vanillaToasterRoot.render(React.createElement(ReactToaster, vanillaToasterOptions as ToasterProps))
  return container
}

function buildVanillaController(element: HTMLElement): VanillaToasterController {
  return {
    element,
    options: vanillaToasterOptions,
    update(options = {}) {
      vanillaToasterOptions = { ...vanillaToasterOptions, ...options }
      renderVanillaToaster()
      return buildVanillaController(element)
    },
    destroy() {
      destroyToaster()
    }
  }
}

function ensureVanillaToaster() {
  const container = renderVanillaToaster()
  return container ? buildVanillaController(container) : null
}

export function createToaster(options: CommonToasterOptions = {}) {
  vanillaToasterOptions = { ...vanillaToasterOptions, ...options }
  return ensureVanillaToaster()
}

export function configureToaster(options: CommonToasterOptions = {}) {
  return createToaster(options)
}

export const Toaster = createToaster

export function getToaster() {
  if (!vanillaToasterElement || !vanillaToasterRoot) {
    return null
  }

  return buildVanillaController(vanillaToasterElement)
}

export function destroyToaster() {
  vanillaToasterRoot?.unmount()
  vanillaToasterRoot = null

  if (vanillaToasterElement?.parentNode) {
    vanillaToasterElement.parentNode.removeChild(vanillaToasterElement)
  }

  vanillaToasterElement = null
}

function ensureVanillaRendererMounted() {
  if (!canUseDOM()) return
  ensureVanillaToaster()
}

type ToastFunction = typeof internalToast

const toast = Object.assign(
  ((message: CommonRenderable, data?: CommonToastOptions) => {
    ensureVanillaRendererMounted()
    return internalToast(message as React.ReactNode, normalizeToastOptions(data))
  }) as unknown as ToastFunction,
  {
    success(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.success(message as React.ReactNode, normalizeToastOptions(data))
    },
    info(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.info(message as React.ReactNode, normalizeToastOptions(data))
    },
    warning(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.warning(message as React.ReactNode, normalizeToastOptions(data))
    },
    error(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.error(message as React.ReactNode, normalizeToastOptions(data))
    },
    loading(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.loading(message as React.ReactNode, normalizeToastOptions(data))
    },
    message(message: CommonRenderable, data?: CommonToastOptions) {
      ensureVanillaRendererMounted()
      return internalToast.message(message as React.ReactNode, normalizeToastOptions(data))
    },
    promise<Data>(promise: Promise<Data> | (() => Promise<Data>), data?: CommonPromiseData<Data>) {
      ensureVanillaRendererMounted()
      return internalToast.promise(promise, normalizePromiseData(data))
    },
    dismiss(id?: number | string) {
      return internalToast.dismiss(id)
    },
    getHistory() {
      return internalToast.getHistory()
    },
    getToasts() {
      return internalToast.getToasts()
    }
  }
)

export { toast }
export type {
  CommonPromiseData,
  CommonPromiseResult,
  CommonPromiseValue,
  CommonRenderable,
  CommonToasterOptions,
  CommonToastAction,
  CommonToastOptions,
  ToastId
} from './core'
