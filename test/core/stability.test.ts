import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastState, resetToastState } from '../../src/core/state'
import { mountToaster } from '../../src/core/renderer'
import { toast } from '../../src/api/toast'
import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { getToaster } from '../../src/api/get-toaster'
import { resetToasts } from '../../src/api/reset-toasts'

const pending = () => {
  let resolve!: (value: string) => void
  const promise = new Promise<string>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
beforeEach(() => {
  destroyToaster()
  resetToastState()
  document.body.innerHTML = ''
  vi.useFakeTimers()
})
afterEach(() => {
  destroyToaster()
  resetToastState()
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('pending promise ownership', () => {
  it.each(['dismiss', 'reset', 'replace', 'destroy'] as const)(
    'does not resurrect a toast after %s',
    async (operation) => {
      createToaster()
      const task = pending()
      const result = toast.promise(task.promise, { loading: 'Working', success: 'Old completion' })
      if (operation === 'dismiss') toast.dismiss(result.id)
      if (operation === 'reset') resetToasts()
      if (operation === 'replace') toast.success('New owner', { id: result.id! })
      if (operation === 'destroy') destroyToaster()
      task.resolve('ok')
      await expect(result.unwrap()).resolves.toBe('ok')
      expect(toast.getToasts().map((record) => record.title)).toEqual(
        operation === 'replace' ? ['New owner'] : []
      )
    }
  )
  it('does not let an older promise overwrite a newer promise with the same id', async () => {
    const first = pending()
    const second = pending()
    const older = toast.promise(first.promise, { id: 'job', loading: 'First', success: 'Old' })
    const newer = toast.promise(second.promise, { id: 'job', loading: 'Second', success: 'New' })
    second.resolve('second')
    await newer.unwrap()
    first.resolve('first')
    await older.unwrap()
    expect(toast.getToasts()[0]?.title).toBe('New')
  })
  it('checks ownership again after an async formatter awaits', async () => {
    const formatted = pending()
    const result = toast.promise(Promise.resolve('ok'), {
      loading: 'Working',
      success: () => formatted.promise
    })
    await Promise.resolve()
    await Promise.resolve()
    toast.dismiss(result.id)
    formatted.resolve('Late message')
    await result.unwrap()
    expect(toast.getToasts()).toEqual([])
  })
  it('clears a loading record when the selected message is omitted or throws', async () => {
    const silent = toast.promise(Promise.resolve('ok'), { loading: 'Loading' })
    await silent.unwrap()
    expect(toast.getToasts()).toEqual([])
    const broken = toast.promise(Promise.resolve('ok'), {
      loading: 'Loading',
      success: () => {
        throw new Error('format')
      }
    })
    await expect(broken.unwrap()).resolves.toBe('ok')
    expect(toast.getToasts()).toEqual([])
  })
  it('preserves settled options even when no loading toast was requested', async () => {
    const result = toast.promise(Promise.resolve('ok'), {
      success: 'Ready',
      duration: Infinity,
      closeButton: true,
      testId: 'result'
    })
    await result.unwrap()
    expect(toast.getToasts()[0]).toMatchObject({
      duration: Infinity,
      closeButton: true,
      testId: 'result'
    })
  })
  it('does not publish a settled-only result after reset', async () => {
    const task = pending()
    const result = toast.promise(task.promise, { success: 'Late' })
    resetToasts()
    task.resolve('ok')
    await result.unwrap()
    expect(toast.getToasts()).toEqual([])
  })
})

describe('renderer lifecycle', () => {
  it('renders state that was created before mounting', () => {
    toast.success('Buffered')
    const controller = mountToaster(document.body)
    expect(controller.element.textContent).toContain('Buffered')
    controller.destroy()
  })
  it('cannot schedule dismissal from a stale destroyed controller or its queued measurement', async () => {
    const controller = mountToaster(document.body, { duration: 10 })
    const id = toast.success('Keep state')
    controller.destroy()
    controller.update({ duration: 1 })
    await Promise.resolve()
    vi.advanceTimersByTime(100)
    expect(toast.getToasts().map((record) => record.id)).toEqual([id])
    expect(document.querySelector('[data-notify-toaster]')).toBeNull()
  })
  it('does not count hidden-document time against a newly created toast', () => {
    const visibility = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    const controller = mountToaster(document.body, { duration: 1000 })
    toast.success('While hidden')
    vi.advanceTimersByTime(2000)
    expect(toast.getToasts()).toHaveLength(1)
    visibility.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(999)
    expect(toast.getToasts()).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(toast.getToasts()).toHaveLength(0)
    controller.destroy()
  })
  it('rolls back a failed mount of buffered custom content', () => {
    toast.custom(() => {
      throw new Error('consumer render failed')
    })
    const before = ToastState.subscribers.length
    expect(() => mountToaster(document.body)).toThrow('consumer render failed')
    expect(document.querySelector('[data-notify-toaster]')).toBeNull()
    expect(ToastState.subscribers).toHaveLength(before)
  })
  it('always unmounts the singleton if a dismissal callback throws', () => {
    createToaster()
    toast.success('Bye', {
      onDismiss: () => {
        throw new Error('consumer callback failed')
      }
    })
    expect(() => destroyToaster()).toThrow('consumer callback failed')
    expect(getToaster()).toBeNull()
    expect(document.querySelector('[data-notify-toaster]')).toBeNull()
  })
  it('does not skip the next subscriber when the first unsubscribes itself', () => {
    const calls: string[] = []
    const first = ToastState.subscribe(() => {
      calls.push('first')
      first()
    })
    const second = ToastState.subscribe(() => calls.push('second'))
    toast('Message')
    expect(calls).toEqual(['first', 'second'])
    second()
  })
})

it('delivers dismissals to every record and subscriber before surfacing an error', () => {
  createToaster()
  toast('First', {
    onDismiss: () => {
      throw new Error('callback')
    }
  })
  toast('Second')
  const events: unknown[] = []
  ToastState.subscribe((event) => events.push(event))
  expect(() => destroyToaster()).toThrow('callback')
  expect(toast.getToasts()).toEqual([])
  expect(events).toHaveLength(2)
})
it('passes an undefined fulfilled value unchanged to its formatter', async () => {
  const callback = vi.fn(() => 'Ready')
  await toast.promise(Promise.resolve(undefined), { success: callback }).unwrap()
  expect(callback).toHaveBeenCalledWith(undefined)
})

it('makes hidden and exiting toasts inert, and hotkey focuses the newest visible item', () => {
  const controller = createToaster({ visibleToasts: 1 })
  const first = toast('First')
  const second = toast('Second')
  const older = controller.element.querySelector(`[data-id="${first}"]`)!
  const newer = controller.element.querySelector(`[data-id="${second}"]`)!
  expect(older.hasAttribute('inert')).toBe(true)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { altKey: true, code: 'KeyT', bubbles: true })
  )
  expect(document.activeElement).toBe(newer)
  toast.dismiss(second)
  expect(newer.hasAttribute('inert')).toBe(true)
  expect(newer.getAttribute('aria-hidden')).toBe('true')
  vi.advanceTimersByTime(200)
  expect(older.hasAttribute('inert')).toBe(false)
})

it('runs promise finally even when loading dismissal throws', async () => {
  createToaster()
  const finished = vi.fn()
  const pending = toast.promise(Promise.resolve('ok'), {
    loading: 'Working',
    onDismiss: () => {
      throw new Error('consumer dismissal')
    },
    finally: finished
  })
  await expect(pending.unwrap()).resolves.toBe('ok')
  expect(finished).toHaveBeenCalledOnce()
  expect(toast.getToasts()).toEqual([])
})
