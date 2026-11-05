/**
 * One consumer integration for the live preview and every copied variant.
 * The package owns rendering, timers, gestures and announcements.
 * @param {HTMLElement} element
 * @param {import('@samline/notify').NotifyApi} api
 * @param {Record<string, string>} copy
 */
export const setupNotifyDemo = (element, api, copy) => {
  const lifecycle = new AbortController()
  const { signal } = lifecycle
  const preset = element.dataset.preset
  const action = element.querySelector('[data-demo-action]')
  const reset = element.querySelector('[data-demo-reset]')
  const dismiss = element.querySelector('[data-demo-dismiss]')
  const cancel = element.querySelector('[data-demo-cancel]')
  const receipt = element.querySelector('[data-demo-result]')
  const item = element.querySelector('[data-demo-item]')
  const progress = element.querySelector('progress')
  const ids = new Set()
  const timers = new Set()
  const initial = receipt.textContent
  let attempts = 0
  let sequence = 0
  let busy = false
  let generation = 0
  let work
  let ownedOptions
  let manual = 0
  let expired = 0
  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      if (!signal.aborted) callback()
    }, delay)
    timers.add(timer)
    return timer
  }
  const own = id => {
    if (id !== undefined) ids.add(id)
    return id
  }
  const result = text => {
    receipt.textContent = text
  }
  const options = () => ({
    position: element.querySelector('[data-position]')?.value ?? 'bottom-right',
    theme:
      element.querySelector('[data-theme]')?.value === 'page' ||
      !element.querySelector('[data-theme]')
        ? document.documentElement.dataset.theme === 'dark'
          ? 'dark'
          : 'light'
        : element.querySelector('[data-theme]').value,
    dir: element.querySelector('[data-direction]')?.value ?? 'ltr',
    richColors: true,
    closeButton: true,
    visibleToasts: Number(element.querySelector('[data-visible-limit]')?.value ?? 3),
    expand: element.querySelector('[data-stack-expanded]')?.checked ?? false,
    duration: preset === 'stream' ? 9000 : 4000,
    style: preset === 'custom' ? { '--width': '23rem' } : { '--width': '22.25rem' },
  })
  const configure = () => {
    const controller = api.createToaster(options())
    ownedOptions = controller.options
    return controller
  }
  const applyPreferences = () => {
    if (!ids.size) return
    const { duration, ...preferences } = options()
    void duration
    const controller = api.getToaster()
    if (controller) ownedOptions = controller.update(preferences).options
  }
  element
    .querySelectorAll('select, [data-stack-expanded]')
    .forEach(control => control.addEventListener('change', applyPreferences, { signal }))
  document.addEventListener(
    'package-site:theme-change',
    () => {
      const controller = api.getToaster()
      const selected = element.querySelector('[data-theme]')?.value
      if (controller?.options === ownedOptions && (!selected || selected === 'page'))
        applyPreferences()
    },
    { signal }
  )
  const runTask = (callback, delay, abortSignal) =>
    new Promise((resolve, reject) => {
      const abort = () => {
        window.clearTimeout(timer)
        timers.delete(timer)
        reject(new DOMException('Canceled by the user', 'AbortError'))
      }
      const timer = later(() => {
        abortSignal.removeEventListener('abort', abort)
        try {
          resolve(callback())
        } catch (error) {
          reject(error)
        }
      }, delay)
      abortSignal.addEventListener('abort', abort, { once: true })
    })
  const snapshot = () => {
    const active = api.toast.getToasts().filter(record => ids.has(record.id)).length
    const history = api.toast.getHistory().filter(record => ids.has(record.id)).length
    result(`${copy.active}: ${active} · ${copy.history}: ${history}`)
  }
  const sendReport = () => {
    attempts += 1
    if (attempts === 1) {
      result(copy.notSent)
      own(
        api.toast.error(copy.sendFailed, {
          description: copy.retryHint,
          duration: Infinity,
          action: { label: copy.retry, onClick: sendReport },
        })
      )
    } else {
      result(copy.sent)
      own(api.toast.success(copy.sent, { description: copy.sentHint }))
    }
  }
  const clear = () => {
    generation += 1
    work?.abort()
    work = undefined
    timers.forEach(timer => window.clearTimeout(timer))
    timers.clear()
    ids.forEach(id => api.toast.dismiss(id))
    ids.clear()
    attempts = 0
    busy = false
    action.disabled = false
    if (item) item.hidden = false
    if (progress) progress.value = 0
    if (cancel) cancel.disabled = true
    const output = element.querySelector('[data-export-output]')
    if (output) {
      output.hidden = true
      output.textContent = ''
    }
    const details = element.querySelector('[data-review-details]')
    if (details) {
      details.hidden = true
      details.textContent = ''
    }
    element.querySelector('[data-event-log]')?.replaceChildren()
    manual = 0
    expired = 0
    result(initial)
  }
  action.addEventListener(
    'click',
    () => {
      configure()
      if (preset === 'save') {
        if (busy) return
        const input = element.querySelector('input')
        const name = input.value.trim()
        if (!name) {
          input.reportValidity()
          return
        }
        busy = true
        action.disabled = true
        work = new AbortController()
        const task = runTask(() => name, 1200, work.signal)
        const pending = api.toast.promise(task, {
          loading: copy.saving,
          success: value => {
            result(`${copy.saved}: ${value}`)
            busy = false
            action.disabled = false
            return { message: copy.saved, description: value }
          },
          error: copy.sendFailed,
        })
        own(pending.id)
      } else if (preset === 'retry') {
        sendReport()
      } else if (preset === 'upload') {
        if (busy) return
        busy = true
        action.disabled = true
        const id = own(api.toast.loading(copy.uploading))
        for (const amount of [25, 50, 75, 100])
          later(() => {
            progress.value = amount
            result(`${copy.uploading} ${amount}%`)
            if (amount < 100) api.toast.loading(`${copy.uploading} ${amount}%`, { id })
            else {
              api.toast.success(copy.uploaded, { id, description: 'campaign-cover.jpg' })
              result(copy.uploaded)
              busy = false
              action.disabled = false
            }
          }, amount * 22)
      } else if (preset === 'undo') {
        if (item.hidden) return
        item.hidden = true
        result(copy.archived)
        own(
          api.toast(copy.archived, {
            duration: 10000,
            description: copy.undoHint,
            action: {
              label: copy.undo,
              onClick: () => {
                item.hidden = false
                result(copy.restored)
                own(api.toast.success(copy.restored))
              },
            },
          })
        )
      } else if (preset === 'persistent') {
        own(
          api.toast.info(copy.invitation, {
            description: copy.invitationDetails,
            duration: Infinity,
            closeButton: true,
          })
        )
        result(copy.invitationDetails)
      } else if (preset === 'custom') {
        action.disabled = true
        let note = ''
        let contentLifecycle
        const disposeContent = () => contentLifecycle?.abort()
        signal.addEventListener('abort', disposeContent, { once: true })
        const id = own(
          api.toast.custom(
            container => {
              disposeContent()
              contentLifecycle = new AbortController()
              const events = { signal: contentLifecycle.signal }
              const content = document.createElement('div')
              content.className = 'notify-receipt'
              const title = document.createElement('strong')
              title.textContent = copy.release
              const detail = document.createElement('p')
              detail.textContent = copy.releaseDetails
              const stats = document.createElement('small')
              stats.textContent = copy.releaseStats
              const label = document.createElement('label')
              label.textContent = copy.noteLabel
              const input = document.createElement('textarea')
              input.placeholder = copy.notePlaceholder
              input.maxLength = 160
              input.rows = 2
              input.value = note
              input.addEventListener(
                'input',
                () => {
                  note = input.value
                },
                events
              )
              // Keep edit keys and text selection inside the form on older CDN builds too.
              input.addEventListener(
                'keydown',
                event => {
                  if (event.key === 'Backspace' || event.key === 'Delete') event.stopPropagation()
                },
                events
              )
              input.addEventListener('pointerdown', event => event.stopPropagation(), events)
              label.append(input)
              const actions = document.createElement('div')
              actions.className = 'notify-receipt-actions'
              const save = document.createElement('button')
              save.type = 'button'
              save.textContent = copy.saveNote
              save.addEventListener(
                'click',
                () => {
                  result(`${copy.noteSaved}: ${note.trim() || copy.releaseDetails}`)
                },
                events
              )
              const close = document.createElement('button')
              close.type = 'button'
              close.textContent = copy.closeReceipt
              close.addEventListener('click', () => api.toast.dismiss(id), events)
              actions.append(save, close)
              content.append(title, detail, stats, label, actions)
              container.append(content)
            },
            {
              duration: Infinity,
              onDismiss: () => {
                disposeContent()
                signal.removeEventListener('abort', disposeContent)
                action.disabled = false
              },
            }
          )
        )
        result(copy.releaseDetails)
      } else if (preset === 'position') {
        own(
          api.toast.success(copy.preference, {
            description: element.querySelector('[data-position]').selectedOptions[0].textContent,
          })
        )
        result(element.querySelector('[data-position]').selectedOptions[0].textContent)
      } else if (preset === 'decisions') {
        const details = element.querySelector('[data-review-details]')
        const id = own(
          api.toast.info(copy.invitation, {
            duration: Infinity,
            description: copy.reviewDetails,
            action: {
              label: copy.review,
              closeOnClick: false,
              onClick: () => {
                details.hidden = false
                details.textContent = copy.reviewDetails
                result(copy.joinQuestion)
                api.toast.info(copy.joinQuestion, {
                  id,
                  duration: Infinity,
                  description: copy.reviewDetails,
                  action: {
                    label: copy.join,
                    closeOnClick: false,
                    onClick: () => {
                      result(copy.joined)
                      api.toast.success(copy.joined, {
                        id,
                        duration: 6000,
                        action: undefined,
                        cancel: undefined,
                      })
                    },
                  },
                  cancel: { label: copy.later, onClick: () => result(copy.deferred) },
                })
              },
            },
            cancel: { label: copy.later, onClick: () => result(copy.deferred) },
          })
        )
      } else if (preset === 'stream') {
        if (busy) return
        busy = true
        action.disabled = true
        const feed = element.querySelector('[data-event-log]')
        const automatic = new Set()
        const update = () =>
          result(
            `${copy.played}: ${feed.children.length} · ${copy.expired}: ${expired} · ${copy.manual}: ${manual}`
          )
        const events = [
          [null, copy.normalEvent],
          ['success', copy.successEvent],
          ['info', copy.infoEvent],
          ['warning', copy.warningEvent],
          ['error', copy.errorEvent],
        ]
        events.forEach(([type, message], index) =>
          later(() => {
            const entry = document.createElement('li')
            entry.textContent = message
            feed.append(entry)
            const controls = {
              onAutoClose: toast => {
                automatic.add(toast.id)
              },
              onDismiss: toast => {
                if (automatic.delete(toast.id)) expired += 1
                else manual += 1
                update()
              },
            }
            own(type ? api.toast[type](message, controls) : api.toast(message, controls))
            update()
            if (index === events.length - 1) {
              busy = false
              action.disabled = false
            }
          }, index * 220)
        )
      } else if (preset === 'task') {
        if (busy) return
        ids.forEach(id => api.toast.dismiss(id))
        ids.clear()
        const current = ++generation
        busy = true
        action.disabled = true
        cancel.disabled = false
        work = new AbortController()
        const operation = work
        const output = element.querySelector('[data-export-output]')
        output.hidden = true
        const fail = element.querySelector('[data-task-outcome]').value === 'error'
        const request = runTask(
          () => {
            if (fail) throw new Error(copy.exportError)
            return 'month,category,total\nOctober,Design,240\nOctober,Engineering,680\nOctober,Support,120'
          },
          2200,
          operation.signal
        )
        const pending = api.toast.promise(request, {
          loading: copy.exporting,
          success: csv => ({
            message: copy.exported,
            description: copy.csvReady,
            action: {
              label: copy.viewCsv,
              onClick: () => {
                if (signal.aborted || current !== generation) return
                output.hidden = false
                output.textContent = csv
                result(copy.csvReady)
              },
            },
          }),
          error: error => ({
            message: error.name === 'AbortError' ? copy.exportStopped : copy.exportFailed,
            description: error.message,
            type: error.name === 'AbortError' ? 'info' : 'error',
          }),
          finally: () => {
            if (signal.aborted || current !== generation) return
            busy = false
            action.disabled = false
            cancel.disabled = true
          },
        })
        own(pending.id)
        result(copy.exporting)
        pending
          .unwrap()
          .then(csv => {
            if (signal.aborted || current !== generation) return
            output.textContent = csv
            result(copy.csvReady)
          })
          .catch(error => {
            if (signal.aborted || current !== generation) return
            result(error.name === 'AbortError' ? copy.exportStopped : copy.exportFailed)
            if (error.name === 'AbortError') api.toast.dismiss(pending.id)
          })
      } else if (preset === 'history') {
        sequence += 1
        own(
          api.toast.success(() => `${copy.activity} ${sequence}`, {
            description: () =>
              new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(
                Date.now()
              ),
            onDismiss: snapshot,
          })
        )
        snapshot()
      }
    },
    { signal }
  )
  cancel?.addEventListener('click', () => work?.abort(), { signal })
  dismiss?.addEventListener(
    'click',
    () => {
      ids.forEach(id => api.toast.dismiss(id))
      if (preset === 'history') snapshot()
      else result(copy.dismissed)
    },
    { signal }
  )
  reset?.addEventListener('click', clear, { signal })
  action.disabled = false
  element.removeAttribute('inert')
  element.dataset.ready = 'true'
  return () => {
    clear()
    lifecycle.abort()
    timers.forEach(timer => window.clearTimeout(timer))
    ids.forEach(id => api.toast.dismiss(id))
    element.dataset.ready = 'false'
  }
}
