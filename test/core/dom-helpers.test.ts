import { describe, expect, it } from 'vitest'

import {
  addListener,
  assignOffset,
  canUseDOM,
  cn,
  createEl,
  getDefaultSwipeDirections,
  getDocumentDirection,
  setAttrs
} from '../../src/core/dom-helpers'
import { MOBILE_VIEWPORT_OFFSET, VIEWPORT_OFFSET } from '../../src/core/constants'

describe('core/dom-helpers', () => {
  describe('cn', () => {
    it('joins truthy class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })
    it('drops falsy values', () => {
      expect(cn('a', undefined, null, false, '', 'b')).toBe('a b')
    })
  })

  describe('canUseDOM', () => {
    it('returns true under jsdom', () => {
      expect(canUseDOM()).toBe(true)
    })
  })

  describe('getDocumentDirection', () => {
    it('returns a valid direction string', () => {
      const dir = getDocumentDirection()
      expect(['ltr', 'rtl']).toContain(dir)
    })
  })

  describe('getDefaultSwipeDirections', () => {
    it('parses top-right correctly', () => {
      expect(getDefaultSwipeDirections('top-right')).toEqual(['top', 'right'])
    })
    it('parses bottom-center correctly', () => {
      expect(getDefaultSwipeDirections('bottom-center')).toEqual(['bottom', 'center'])
    })
    it('handles single-axis position', () => {
      expect(getDefaultSwipeDirections('top')).toEqual(['top'])
    })
  })

  describe('assignOffset', () => {
    it('falls back to default viewport offset when nothing is provided', () => {
      const result = assignOffset(undefined, undefined)
      expect(result['--offset-top']).toBe(VIEWPORT_OFFSET)
      expect(result['--offset-bottom']).toBe(VIEWPORT_OFFSET)
      expect(result['--offset-left']).toBe(VIEWPORT_OFFSET)
      expect(result['--offset-right']).toBe(VIEWPORT_OFFSET)
      expect(result['--mobile-offset-top']).toBe(MOBILE_VIEWPORT_OFFSET)
    })

    it('applies a numeric offset to all four sides', () => {
      const result = assignOffset(10, 4)
      expect(result['--offset-top']).toBe('10px')
      expect(result['--offset-bottom']).toBe('10px')
      expect(result['--mobile-offset-top']).toBe('4px')
    })

    it('applies a string offset verbatim', () => {
      const result = assignOffset('2rem', undefined)
      expect(result['--offset-top']).toBe('2rem')
    })

    it('per-side values use defaults where omitted', () => {
      const result = assignOffset({ top: 5, right: 10 }, undefined)
      expect(result['--offset-top']).toBe('5px')
      expect(result['--offset-right']).toBe('10px')
      expect(result['--offset-bottom']).toBe(VIEWPORT_OFFSET)
      expect(result['--offset-left']).toBe(VIEWPORT_OFFSET)
    })
  })

  describe('createEl', () => {
    it('creates an element with the requested tag', () => {
      const div = createEl('div')
      expect(div.tagName).toBe('DIV')
    })

    it('applies attributes', () => {
      const button = createEl('button', { type: 'button', 'data-foo': 'bar' })
      expect(button.getAttribute('type')).toBe('button')
      expect(button.getAttribute('data-foo')).toBe('bar')
    })

    it('drops boolean false / null / undefined attributes', () => {
      const div = createEl('div', {
        'data-keep': 'yes',
        'data-drop': false,
        'data-null': null,
        'data-undef': undefined
      })
      expect(div.hasAttribute('data-keep')).toBe(true)
      expect(div.hasAttribute('data-drop')).toBe(false)
      expect(div.hasAttribute('data-null')).toBe(false)
      expect(div.hasAttribute('data-undef')).toBe(false)
    })

    it('appends children (text and nodes)', () => {
      const div = createEl('div', undefined, ['hello ', 42, null, 'world'])
      expect(div.textContent).toBe('hello 42world')
    })
  })

  describe('setAttrs', () => {
    it('sets a single attribute', () => {
      const div = document.createElement('div')
      setAttrs(div, { 'data-foo': 'bar' })
      expect(div.getAttribute('data-foo')).toBe('bar')
    })
  })

  describe('addListener', () => {
    it('returns a working unsubscribe function', () => {
      const target = document.createElement('div')
      let called = 0
      const handler = () => {
        called += 1
      }
      const unsubscribe = addListener(target, 'click', handler)

      target.dispatchEvent(new Event('click'))
      expect(called).toBe(1)

      unsubscribe()
      target.dispatchEvent(new Event('click'))
      expect(called).toBe(1)
    })
  })
})
