// Low-level DOM helpers used by the renderer and the api factories.
// Pure: no controller state, no shared state, no framework imports.

import type { Direction, Offset, SwipeDirection } from './types'
import { MOBILE_VIEWPORT_OFFSET, VIEWPORT_OFFSET } from './constants'

/**
 * Join class names, dropping falsy values. Mirrors the `cn` helper that
 * previously lived in the React renderer's `_runtime.ts`.
 */
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * True when the runtime exposes a real `window` and `document`. Lets
 * api methods bail out cleanly during SSR / Node imports.
 */
export function canUseDOM(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Read the document's effective text direction. Mirrors the legacy
 * helper: it honors an explicit `<html dir="auto|ltr|rtl">` attribute and
 * otherwise falls back to the computed CSS direction.
 */
export function getDocumentDirection(): Direction {
  if (!canUseDOM()) return 'ltr'

  const dirAttribute = document.documentElement.getAttribute('dir')

  if (dirAttribute === 'auto' || !dirAttribute) {
    const computed = window.getComputedStyle(document.documentElement).direction
    if (computed === 'ltr' || computed === 'rtl') {
      return computed
    }
    // jsdom and similar minimal DOMs may not return a real `direction`
    // from `getComputedStyle`. Default to 'ltr' in that case.
    return 'ltr'
  }

  return dirAttribute as Direction
}

/**
 * Default swipe directions derived from a position string
 * (e.g. `"top-right"` → `["top", "right"]`).
 */
export function getDefaultSwipeDirections(position: string): SwipeDirection[] {
  const parts = position.split('-') as [SwipeDirection | undefined, SwipeDirection | undefined]
  const directions: SwipeDirection[] = []
  if (parts[0]) directions.push(parts[0])
  if (parts[1]) directions.push(parts[1])
  return directions
}

/**
 * Resolve an `Offset` (number, string, or per-side object) into the
 * CSS custom properties the toaster consumes
 * (`--offset-top`, `--offset-right`, `--offset-bottom`, `--offset-left`,
 *  plus the `--mobile-offset-*` quartet).
 *
 * Numeric values get a `px` suffix; strings are forwarded verbatim.
 */
export function assignOffset(
  defaultOffset: Offset | undefined,
  mobileOffset: Offset | undefined
): Record<string, string> {
  const styles: Record<string, string> = {}

  ;[defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1
    const prefix = isMobile ? '--mobile-offset' : '--offset'
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET

    const assignAll = (value: string | number) => {
      for (const key of ['top', 'right', 'bottom', 'left'] as const) {
        styles[`${prefix}-${key}`] = typeof value === 'number' ? `${value}px` : value
      }
    }

    if (typeof offset === 'number' || typeof offset === 'string') {
      assignAll(offset)
    } else if (offset && typeof offset === 'object') {
      for (const key of ['top', 'right', 'bottom', 'left'] as const) {
        const value = offset[key]
        if (value === undefined) {
          styles[`${prefix}-${key}`] = defaultValue
        } else {
          styles[`${prefix}-${key}`] = typeof value === 'number' ? `${value}px` : value
        }
      }
    } else {
      assignAll(defaultValue)
    }
  })

  return styles
}

/**
 * Tiny `createElement` wrapper. Supports the attribute set we actually
 * need (id, data-*, aria-*, class, type, dir, role, tabIndex, plus any
 * other valid HTML attribute) and a list of children (string, number,
 * Node, or null).
 */
export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | number | boolean | undefined | null>,
  children?: Array<Node | string | number | null | undefined>
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  if (attrs) setAttrs(element, attrs)
  if (children) {
    for (const child of children) {
      if (child === null || child === undefined) continue
      if (typeof child === 'string' || typeof child === 'number') {
        element.appendChild(document.createTextNode(String(child)))
      } else {
        element.appendChild(child)
      }
    }
  }
  return element
}

/**
 * Batch `setAttribute` with boolean-aware semantics: `true` sets the
 * attribute to an empty string, `false`/`null`/`undefined` removes it.
 */
export function setAttrs(
  el: Element,
  attrs: Record<string, string | number | boolean | undefined | null>
): void {
  for (const [name, raw] of Object.entries(attrs)) {
    if (raw === false || raw === null || raw === undefined) {
      el.removeAttribute(name)
      continue
    }
    if (raw === true) {
      el.setAttribute(name, '')
      continue
    }
    el.setAttribute(name, String(raw))
  }
}

/**
 * `addEventListener` that returns its own cleanup function so callers
 * can stash it for `destroy()` and never have to thread the same
 * `(target, type, handler)` triple twice.
 */
export function addListener<K extends keyof HTMLElementEventMap>(
  target: EventTarget,
  type: K | string,
  handler: EventListenerOrEventListenerObject
): () => void {
  target.addEventListener(type as string, handler as EventListener)
  return () => target.removeEventListener(type as string, handler as EventListener)
}

/**
 * Inline a raw HTML string into a target element via `innerHTML` and
 * return the element. Use sparingly — only for trusted SVG strings we
 * generate ourselves (see `core/icons.ts`).
 */
export function setInnerHTML(el: Element, html: string): void {
  el.innerHTML = html
}
