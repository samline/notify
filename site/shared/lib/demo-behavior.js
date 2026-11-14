// One self-contained function per scenario, shared by the live previews and the
// copied files. demo-files.ts copies the region of the chosen scenario (and
// `wait` when it uses it) into main.js without `export`. Keep regions plain
// JavaScript. `signal` only lets the website detach a preview; a copied file
// calls the function without it.

// #region wait
// Resolves true after `ms`, or false as soon as `signal` aborts.
const wait = (ms, signal) =>
  new Promise(resolve => {
    const timer = setTimeout(resolve, ms, true)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve(false)
      },
      { once: true }
    )
  })
// #endregion wait

// #region save
const saveDemo = (element, notify, copy, signal) => {
  const input = element.querySelector('input')
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  let pending = new AbortController()

  action.addEventListener(
    'click',
    () => {
      const name = input.value.trim()
      if (!name) return input.reportValidity()

      notify.createToaster({ richColors: true, closeButton: true })
      action.disabled = true
      const saving = wait(1200, pending.signal).then(done => {
        if (!done) throw new DOMException('Reset', 'AbortError')
        return name
      })
      notify.toast.promise(saving, {
        loading: copy.saving,
        success: saved => {
          result.textContent = `${copy.saved}: ${saved}`
          action.disabled = false
          return { message: copy.saved, description: saved }
        },
      })
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      pending.abort()
      pending = new AbortController()
      notify.toast.dismiss()
      action.disabled = false
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion save

// #region retry
const retryDemo = (element, notify, copy, signal) => {
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  let attempts = 0

  const send = () => {
    attempts += 1
    if (attempts === 1) {
      result.textContent = copy.notSent
      notify.toast.error(copy.sendFailed, {
        description: copy.retryHint,
        duration: Infinity,
        action: { label: copy.retry, onClick: send },
      })
    } else {
      result.textContent = copy.sent
      notify.toast.success(copy.sent, { description: copy.sentHint })
    }
  }

  action.addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true })
      send()
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      attempts = 0
      notify.toast.dismiss()
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion retry

// #region upload
const uploadDemo = (element, notify, copy, signal) => {
  const progress = element.querySelector('progress')
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  let pending = new AbortController()

  action.addEventListener(
    'click',
    async () => {
      notify.createToaster({ richColors: true, closeButton: true })
      action.disabled = true
      const id = notify.toast.loading(copy.uploading)

      for (const percent of [25, 50, 75, 100]) {
        if (!(await wait(550, pending.signal))) return
        progress.value = percent
        result.textContent = `${copy.uploading} ${percent}%`
        if (percent < 100) notify.toast.loading(`${copy.uploading} ${percent}%`, { id })
      }

      // Passing the same id turns the loading toast into a success.
      notify.toast.success(copy.uploaded, { id, description: 'campaign-cover.jpg' })
      result.textContent = copy.uploaded
      action.disabled = false
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      pending.abort()
      pending = new AbortController()
      notify.toast.dismiss()
      progress.value = 0
      action.disabled = false
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion upload

// #region undo
const undoDemo = (element, notify, copy, signal) => {
  const item = element.querySelector('[data-demo-item]')
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent

  action.addEventListener(
    'click',
    () => {
      if (item.hidden) return

      notify.createToaster({ richColors: true, closeButton: true })
      item.hidden = true
      result.textContent = copy.archived
      notify.toast(copy.archived, {
        description: copy.undoHint,
        duration: 10000,
        action: {
          label: copy.undo,
          onClick: () => {
            item.hidden = false
            result.textContent = copy.restored
            notify.toast.success(copy.restored)
          },
        },
      })
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      item.hidden = false
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion undo

// #region persistent
const persistentDemo = (element, notify, copy, signal) => {
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent

  action.addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true })
      notify.toast.info(copy.invitation, {
        description: copy.invitationDetails,
        duration: Infinity,
      })
      result.textContent = copy.invitationDetails
    },
    { signal }
  )

  element.querySelector('[data-demo-dismiss]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      result.textContent = copy.dismissed
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion persistent

// #region custom
const customDemo = (element, notify, copy, signal) => {
  // The card's markup lives in a <template> inside the demo.
  const template = element.querySelector('template')
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent

  action.addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true, style: { '--width': '23rem' } })
      action.disabled = true
      let note = '' // Kept outside the factory: Notify may render the card again.

      notify.toast.custom(
        (container, { dismiss }) => {
          const card = template.content.cloneNode(true)
          const textarea = card.querySelector('textarea')
          textarea.value = note
          textarea.addEventListener('input', () => {
            note = textarea.value
          })
          card.querySelector('[data-save-note]').addEventListener('click', () => {
            result.textContent = `${copy.noteSaved}: ${note.trim() || copy.releaseDetails}`
          })
          card.querySelector('[data-close-receipt]').addEventListener('click', dismiss)
          container.append(card)
        },
        {
          duration: Infinity,
          onDismiss: () => {
            action.disabled = false
          },
        }
      )
      result.textContent = copy.releaseDetails
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      action.disabled = false
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion custom

// #region position
const positionDemo = (element, notify, copy, signal) => {
  const [place, theme, direction] = ['position', 'theme', 'direction'].map(name =>
    element.querySelector(`[data-${name}]`)
  )
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  // "Follow the page" sends no theme, so the toaster keeps its default.
  const preferences = () => ({
    position: place.value,
    theme: theme.value === 'page' ? undefined : theme.value,
    dir: direction.value,
  })

  // Changing a preference updates the toast that is already on screen.
  for (const select of [place, theme, direction]) {
    select.addEventListener(
      'change',
      () => {
        if (notify.toast.getToasts().length) notify.createToaster(preferences())
      },
      { signal }
    )
  }

  element.querySelector('[data-demo-action]').addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true, ...preferences() })
      const label = place.selectedOptions[0].textContent
      notify.toast.success(copy.preference, { description: label })
      result.textContent = label
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion position

// #region history
const historyDemo = (element, notify, copy, signal) => {
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  const mine = new Set() // ids created by this demo
  let count = 0

  // A dismissed toast leaves getToasts() but stays in getHistory().
  const snapshot = () => {
    const owned = records => records.filter(record => mine.has(record.id)).length
    const active = owned(notify.toast.getToasts())
    const history = owned(notify.toast.getHistory())
    result.textContent = `${copy.active}: ${active} · ${copy.history}: ${history}`
  }

  action.addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true })
      count += 1
      // Functions are evaluated each time the toast renders.
      const id = notify.toast.success(() => `${copy.activity} ${count}`, {
        description: () =>
          new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        onDismiss: snapshot,
      })
      mine.add(id)
      snapshot()
    },
    { signal }
  )

  element.querySelector('[data-demo-dismiss]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      snapshot()
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      mine.clear()
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion history

// #region decisions
const decisionsDemo = (element, notify, copy, signal) => {
  const details = element.querySelector('[data-review-details]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  const notNow = { label: copy.later, onClick: () => (result.textContent = copy.deferred) }
  let id

  // closeOnClick: false keeps one toast alive while its action changes.
  const join = () => {
    result.textContent = copy.joined
    notify.toast.success(copy.joined, { id, duration: 6000, action: undefined, cancel: undefined })
  }
  const review = () => {
    details.hidden = false
    details.textContent = copy.reviewDetails
    result.textContent = copy.joinQuestion
    notify.toast.info(copy.joinQuestion, {
      id,
      description: copy.reviewDetails,
      duration: Infinity,
      action: { label: copy.join, closeOnClick: false, onClick: join },
      cancel: notNow,
    })
  }

  element.querySelector('[data-demo-action]').addEventListener(
    'click',
    () => {
      notify.createToaster({ richColors: true, closeButton: true })
      id = notify.toast.info(copy.invitation, {
        description: copy.reviewDetails,
        duration: Infinity,
        action: { label: copy.review, closeOnClick: false, onClick: review },
        cancel: notNow,
      })
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      notify.toast.dismiss()
      details.hidden = true
      details.textContent = ''
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion decisions

// #region stream
const streamDemo = (element, notify, copy, signal) => {
  const feed = element.querySelector('[data-event-log]')
  const limit = element.querySelector('[data-visible-limit]')
  const expanded = element.querySelector('[data-stack-expanded]')
  const action = element.querySelector('[data-demo-action]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  const stack = () => ({ visibleToasts: Number(limit.value), expand: expanded.checked })
  const events = [
    [undefined, copy.normalEvent],
    ['success', copy.successEvent],
    ['info', copy.infoEvent],
    ['warning', copy.warningEvent],
    ['error', copy.errorEvent],
  ]
  let pending = new AbortController()
  let autoClosed = 0
  let dismissedByYou = 0

  const summary = () => {
    result.textContent = `${copy.played}: ${feed.children.length} · ${copy.expired}: ${autoClosed} · ${copy.manual}: ${dismissedByYou}`
  }

  // Changing the stack updates the toasts that are already on screen.
  for (const control of [limit, expanded]) {
    control.addEventListener(
      'change',
      () => {
        if (notify.toast.getToasts().length) notify.createToaster(stack())
      },
      { signal }
    )
  }

  action.addEventListener(
    'click',
    async () => {
      notify.createToaster({ richColors: true, closeButton: true, ...stack() })
      action.disabled = true
      const run = pending
      const timedOut = new Set()

      for (const [index, [type, message]] of events.entries()) {
        if (index > 0 && !(await wait(220, run.signal))) return
        feed.append(Object.assign(document.createElement('li'), { textContent: message }))
        const options = {
          duration: 9000,
          // onAutoClose runs before onDismiss when the timer ends the toast.
          onAutoClose: toast => timedOut.add(toast.id),
          onDismiss: toast => {
            if (run !== pending) return
            if (timedOut.delete(toast.id)) autoClosed += 1
            else dismissedByYou += 1
            summary()
          },
        }
        if (type) notify.toast[type](message, options)
        else notify.toast(message, options)
        summary()
      }
      action.disabled = false
    },
    { signal }
  )

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      pending.abort()
      pending = new AbortController()
      notify.toast.dismiss()
      feed.replaceChildren()
      autoClosed = 0
      dismissedByYou = 0
      action.disabled = false
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion stream

// #region task
const taskDemo = (element, notify, copy, signal) => {
  const action = element.querySelector('[data-demo-action]')
  const cancel = element.querySelector('[data-demo-cancel]')
  const preview = element.querySelector('[data-export-output]')
  const outcome = element.querySelector('[data-task-outcome]')
  const result = element.querySelector('[data-demo-result]')
  const initial = result.textContent
  const csv =
    'month,category,total\nOctober,Design,240\nOctober,Engineering,680\nOctober,Support,120'
  let pending = new AbortController()

  action.addEventListener(
    'click',
    async () => {
      notify.createToaster({ richColors: true, closeButton: true })
      const run = (pending = new AbortController())
      action.disabled = true
      cancel.disabled = false
      preview.hidden = true

      // A stand-in for a request: it fails on demand and can be canceled.
      const request = wait(2200, run.signal).then(done => {
        if (!done) throw new DOMException(copy.exportStopped, 'AbortError')
        if (outcome.value === 'error') throw new Error(copy.exportError)
        return csv
      })
      const toast = notify.toast.promise(request, {
        loading: copy.exporting,
        success: data => ({
          message: copy.exported,
          description: copy.csvReady,
          action: {
            label: copy.viewCsv,
            onClick: () => {
              preview.textContent = data
              preview.hidden = false
            },
          },
        }),
        error: error => ({ message: copy.exportFailed, description: error.message }),
      })
      result.textContent = copy.exporting

      try {
        await toast.unwrap()
        result.textContent = copy.csvReady
      } catch (error) {
        if (run !== pending) return // reset while waiting
        const canceled = error.name === 'AbortError'
        result.textContent = canceled ? copy.exportStopped : copy.exportFailed
        if (canceled) notify.toast.dismiss(toast.id)
      }
      action.disabled = false
      cancel.disabled = true
    },
    { signal }
  )

  cancel.addEventListener('click', () => pending.abort(), { signal })

  element.querySelector('[data-demo-reset]').addEventListener(
    'click',
    () => {
      pending.abort()
      pending = new AbortController()
      notify.toast.dismiss()
      action.disabled = false
      cancel.disabled = true
      preview.hidden = true
      preview.textContent = ''
      result.textContent = initial
    },
    { signal }
  )
}
// #endregion task

// The live previews pick a scenario by name; the copied files call one directly.
export const scenarios = {
  save: saveDemo,
  retry: retryDemo,
  upload: uploadDemo,
  undo: undoDemo,
  persistent: persistentDemo,
  custom: customDemo,
  position: positionDemo,
  history: historyDemo,
  decisions: decisionsDemo,
  stream: streamDemo,
  task: taskDemo,
}
