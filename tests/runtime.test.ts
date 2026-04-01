import { describe, expect, it } from 'vitest'

import { assignOffset, cn, getDefaultSwipeDirections, canUseDOM } from '../src/_runtime'

describe('runtime helpers', () => {
  it('joins class names', () => {
    expect(cn('one', undefined, 'two', '')).toBe('one two')
  })

  it('returns the expected swipe directions', () => {
    expect(getDefaultSwipeDirections('top-left')).toEqual(['top', 'left'])
  })

  it('assigns offsets for all sides when a scalar is provided', () => {
    expect(assignOffset(12, 8)).toMatchObject({
      '--offset-top': '12px',
      '--offset-right': '12px',
      '--offset-bottom': '12px',
      '--offset-left': '12px',
      '--mobile-offset-top': '8px',
      '--mobile-offset-right': '8px',
      '--mobile-offset-bottom': '8px',
      '--mobile-offset-left': '8px'
    })
  })

  it('detects the absence of a DOM in node tests', () => {
    expect(canUseDOM()).toBe(false)
  })
})
