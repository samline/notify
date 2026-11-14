// One short function per scenario, shared by the live previews and the copied files.
// demo-files.ts copies the `demo` region plus the region of the chosen scenario
// into main.js (without `export`). Keep regions plain JavaScript and self-contained.

// #region demo
// Small helper shared by every scenario: the result line, the toasts the demo
// owns, abortable waits and the reset button. It is not part of Notify.
export const createDemo = (element, notify) => {
  const lifecycle = new AbortController()
  const output = element.querySelector('[data-demo-result]')
  const initial = output.textContent
  const ids = new Set()
  const resets = []
  let run = new AbortController()

  // Listen to a control. An aborted wait() just ends the handler.
  const on = (selector, handler) => {
    element.querySelector(selector).addEventListener(
      'click',
      async () => {
        try {
          await handler()
        } catch (error) {
          if (error.name !== 'AbortError') throw error
        }
      },
      { signal: lifecycle.signal }
    )
  }
  const reset = () => {
    run.abort()
    run = new AbortController()
    ids.forEach(id => notify.toast.dismiss(id))
    ids.clear()
    action.disabled = false
    resets.forEach(callback => callback())
    output.textContent = initial
  }
  const action = element.querySelector('[data-demo-action]')
  on('[data-demo-reset]', reset)

  return {
    element,
    action,
    ids,
    signal: lifecycle.signal,
    // Aborted by reset, so work started before a reset can tell it is stale.
    get run() {
      return run.signal
    },
    on,
    onAction: handler => on('[data-demo-action]', handler),
    onReset: callback => resets.push(callback),
    show: text => {
      output.textContent = text
    },
    own: id => {
      ids.add(id)
      return id
    },
    dismissAll: () => ids.forEach(id => notify.toast.dismiss(id)),
    // Resolves after `ms`; rejects with an AbortError when its signal aborts.
    wait: (ms, signal = run.signal) =>
      new Promise((resolve, reject) => {
        if (signal.aborted) return reject(signal.reason)
        const timer = setTimeout(resolve, ms)
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer)
            reject(signal.reason)
          },
          { once: true }
        )
      }),
    destroy: () => {
      reset()
      lifecycle.abort()
    },
  }
}
// #endregion demo

// #region save
const saveDemo = (demo, notify, copy) => {
  const input = demo.element.querySelector('input')

  demo.onAction(() => {
    const name = input.value.trim()
    if (!name) return input.reportValidity()

    notify.createToaster({ richColors: true, closeButton: true })
    demo.action.disabled = true
    const saving = demo.wait(1200).then(() => name)
    const toast = notify.toast.promise(saving, {
      loading: copy.saving,
      success: saved => {
        demo.show(`${copy.saved}: ${saved}`)
        demo.action.disabled = false
        return { message: copy.saved, description: saved }
      },
    })
    demo.own(toast.id)
  })
}
// #endregion save

// #region retry
const retryDemo = (demo, notify, copy) => {
  let attempts = 0
  demo.onReset(() => {
    attempts = 0
  })

  const send = () => {
    attempts += 1
    if (attempts === 1) {
      demo.show(copy.notSent)
      demo.own(
        notify.toast.error(copy.sendFailed, {
          description: copy.retryHint,
          duration: Infinity,
          action: { label: copy.retry, onClick: send },
        })
      )
    } else {
      demo.show(copy.sent)
      demo.own(notify.toast.success(copy.sent, { description: copy.sentHint }))
    }
  }

  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true })
    send()
  })
}
// #endregion retry

// #region upload
const uploadDemo = (demo, notify, copy) => {
  const progress = demo.element.querySelector('progress')
  demo.onReset(() => {
    progress.value = 0
  })

  demo.onAction(async () => {
    notify.createToaster({ richColors: true, closeButton: true })
    demo.action.disabled = true
    const id = demo.own(notify.toast.loading(copy.uploading))

    for (const percent of [25, 50, 75, 100]) {
      await demo.wait(550)
      progress.value = percent
      demo.show(`${copy.uploading} ${percent}%`)
      if (percent < 100) notify.toast.loading(`${copy.uploading} ${percent}%`, { id })
    }

    // Passing the same id turns the loading toast into a success.
    notify.toast.success(copy.uploaded, { id, description: 'campaign-cover.jpg' })
    demo.show(copy.uploaded)
    demo.action.disabled = false
  })
}
// #endregion upload

// #region undo
const undoDemo = (demo, notify, copy) => {
  const item = demo.element.querySelector('[data-demo-item]')
  demo.onReset(() => {
    item.hidden = false
  })

  demo.onAction(() => {
    if (item.hidden) return

    notify.createToaster({ richColors: true, closeButton: true })
    item.hidden = true
    demo.show(copy.archived)
    demo.own(
      notify.toast(copy.archived, {
        description: copy.undoHint,
        duration: 10000,
        action: {
          label: copy.undo,
          onClick: () => {
            item.hidden = false
            demo.show(copy.restored)
            demo.own(notify.toast.success(copy.restored))
          },
        },
      })
    )
  })
}
// #endregion undo

// #region persistent
const persistentDemo = (demo, notify, copy) => {
  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true })
    demo.own(
      notify.toast.info(copy.invitation, {
        description: copy.invitationDetails,
        duration: Infinity,
      })
    )
    demo.show(copy.invitationDetails)
  })

  demo.on('[data-demo-dismiss]', () => {
    demo.dismissAll()
    demo.show(copy.dismissed)
  })
}
// #endregion persistent

// #region custom
const customDemo = (demo, notify, copy) => {
  // The card's markup lives in a <template> inside the demo.
  const template = demo.element.querySelector('template')

  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true, style: { '--width': '23rem' } })
    demo.action.disabled = true
    let note = '' // Kept outside the factory: Notify may render the card again.

    const id = notify.toast.custom(
      (container, { dismiss }) => {
        const card = template.content.cloneNode(true)
        const textarea = card.querySelector('textarea')
        textarea.value = note
        textarea.addEventListener('input', () => {
          note = textarea.value
        })
        card.querySelector('[data-save-note]').addEventListener('click', () => {
          demo.show(`${copy.noteSaved}: ${note.trim() || copy.releaseDetails}`)
        })
        card.querySelector('[data-close-receipt]').addEventListener('click', dismiss)
        container.append(card)
      },
      {
        duration: Infinity,
        onDismiss: () => {
          demo.action.disabled = false
        },
      }
    )
    demo.own(id)
    demo.show(copy.releaseDetails)
  })
}
// #endregion custom

// #region position
const positionDemo = (demo, notify, copy) => {
  const [place, theme, direction] = ['position', 'theme', 'direction'].map(name =>
    demo.element.querySelector(`[data-${name}]`)
  )
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
      { signal: demo.signal }
    )
  }

  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true, ...preferences() })
    const label = place.selectedOptions[0].textContent
    demo.own(notify.toast.success(copy.preference, { description: label }))
    demo.show(label)
  })
}
// #endregion position

// #region history
const historyDemo = (demo, notify, copy) => {
  let count = 0

  // Active toasts leave getToasts() when dismissed; getHistory() keeps them.
  const snapshot = () => {
    const mine = records => records.filter(record => demo.ids.has(record.id)).length
    const active = mine(notify.toast.getToasts())
    const history = mine(notify.toast.getHistory())
    demo.show(`${copy.active}: ${active} · ${copy.history}: ${history}`)
  }

  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true })
    count += 1
    demo.own(
      // Functions are evaluated each time the toast renders.
      notify.toast.success(() => `${copy.activity} ${count}`, {
        description: () =>
          new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        onDismiss: snapshot,
      })
    )
    snapshot()
  })

  demo.on('[data-demo-dismiss]', () => {
    demo.dismissAll()
    snapshot()
  })
}
// #endregion history

// #region decisions
const decisionsDemo = (demo, notify, copy) => {
  const details = demo.element.querySelector('[data-review-details]')
  demo.onReset(() => {
    details.hidden = true
    details.textContent = ''
  })

  const notNow = { label: copy.later, onClick: () => demo.show(copy.deferred) }
  let id

  // closeOnClick: false keeps one toast alive while its action changes.
  const join = () => {
    demo.show(copy.joined)
    notify.toast.success(copy.joined, { id, duration: 6000, action: undefined, cancel: undefined })
  }
  const review = () => {
    details.hidden = false
    details.textContent = copy.reviewDetails
    demo.show(copy.joinQuestion)
    notify.toast.info(copy.joinQuestion, {
      id,
      description: copy.reviewDetails,
      duration: Infinity,
      action: { label: copy.join, closeOnClick: false, onClick: join },
      cancel: notNow,
    })
  }

  demo.onAction(() => {
    notify.createToaster({ richColors: true, closeButton: true })
    id = demo.own(
      notify.toast.info(copy.invitation, {
        description: copy.reviewDetails,
        duration: Infinity,
        action: { label: copy.review, closeOnClick: false, onClick: review },
        cancel: notNow,
      })
    )
  })
}
// #endregion decisions

// #region stream
const streamDemo = (demo, notify, copy) => {
  const feed = demo.element.querySelector('[data-event-log]')
  const limit = demo.element.querySelector('[data-visible-limit]')
  const expanded = demo.element.querySelector('[data-stack-expanded]')
  const stack = () => ({ visibleToasts: Number(limit.value), expand: expanded.checked })
  const events = [
    [undefined, copy.normalEvent],
    ['success', copy.successEvent],
    ['info', copy.infoEvent],
    ['warning', copy.warningEvent],
    ['error', copy.errorEvent],
  ]
  let dismissedByYou = 0
  let autoClosed = 0
  demo.onReset(() => {
    feed.replaceChildren()
    dismissedByYou = 0
    autoClosed = 0
  })

  const summary = () =>
    demo.show(
      `${copy.played}: ${feed.children.length} · ${copy.expired}: ${autoClosed} · ${copy.manual}: ${dismissedByYou}`
    )

  // Changing the stack updates the toasts that are already on screen.
  for (const control of [limit, expanded]) {
    control.addEventListener(
      'change',
      () => {
        if (notify.toast.getToasts().length) notify.createToaster(stack())
      },
      { signal: demo.signal }
    )
  }

  demo.onAction(async () => {
    notify.createToaster({ richColors: true, closeButton: true, ...stack() })
    demo.action.disabled = true
    const run = demo.run
    const timedOut = new Set()

    for (const [type, message] of events) {
      feed.append(Object.assign(document.createElement('li'), { textContent: message }))
      const options = {
        duration: 9000,
        // onAutoClose runs before onDismiss when the timer ends the toast.
        onAutoClose: toast => timedOut.add(toast.id),
        onDismiss: toast => {
          if (run.aborted) return
          if (timedOut.delete(toast.id)) autoClosed += 1
          else dismissedByYou += 1
          summary()
        },
      }
      demo.own(type ? notify.toast[type](message, options) : notify.toast(message, options))
      summary()
      await demo.wait(220)
    }
    demo.action.disabled = false
  })
}
// #endregion stream

// #region task
const taskDemo = (demo, notify, copy) => {
  const cancel = demo.element.querySelector('[data-demo-cancel]')
  const preview = demo.element.querySelector('[data-export-output]')
  const outcome = demo.element.querySelector('[data-task-outcome]')
  const csv =
    'month,category,total\nOctober,Design,240\nOctober,Engineering,680\nOctober,Support,120'
  let canceler = new AbortController()
  demo.onReset(() => {
    canceler.abort()
    cancel.disabled = true
    preview.hidden = true
    preview.textContent = ''
  })

  demo.on('[data-demo-cancel]', () => canceler.abort())

  demo.onAction(async () => {
    notify.createToaster({ richColors: true, closeButton: true })
    const run = demo.run
    canceler = new AbortController()
    demo.action.disabled = true
    cancel.disabled = false
    preview.hidden = true

    // A stand-in for a request: it fails on demand and can be canceled.
    const request = demo.wait(2200, canceler.signal).then(() => {
      if (outcome.value === 'error') throw new Error(copy.exportError)
      return csv
    })
    const toast = notify.toast.promise(request, {
      loading: copy.exporting,
      success: result => ({
        message: copy.exported,
        description: copy.csvReady,
        action: {
          label: copy.viewCsv,
          onClick: () => {
            preview.textContent = result
            preview.hidden = false
          },
        },
      }),
      error: error => ({ message: copy.exportFailed, description: error.message }),
    })
    demo.own(toast.id)
    demo.show(copy.exporting)

    try {
      await toast.unwrap()
      demo.show(copy.csvReady)
    } catch (error) {
      if (run.aborted) return
      const canceled = error.name === 'AbortError'
      demo.show(canceled ? copy.exportStopped : copy.exportFailed)
      if (canceled) notify.toast.dismiss(toast.id)
    }
    if (!run.aborted) {
      demo.action.disabled = false
      cancel.disabled = true
    }
  })
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
