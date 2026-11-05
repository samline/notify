// Include once after the Notify standalone script, preferably in the layout.
;(() => {
  const key = Symbol.for('samline.notify.host-integration')
  if (window[key]) return
  const notify = window.Notify.default ?? window.Notify
  const owners = new Map()
  const unloaded = new WeakSet()
  const mount = root => {
    if (owners.has(root) || unloaded.has(root)) return
    const lifecycle = new AbortController()
    notify.createToaster({ richColors: true, closeButton: true })
    root.querySelectorAll('[data-notify-save]').forEach(button => {
      button.addEventListener('click', () => notify.toast.success('Changes saved'), {
        signal: lifecycle.signal,
      })
    })
    owners.set(root, () => lifecycle.abort())
  }
  const refresh = () => {
    document.querySelectorAll('[data-notify-host]').forEach(mount)
    for (const [root, cleanup] of owners) {
      if (!root.isConnected) {
        cleanup()
        owners.delete(root)
      }
    }
    if (!owners.size) notify.destroyToaster()
  }
  const lifecycle = new AbortController()
  const observer = new MutationObserver(refresh)
  observer.observe(document.body, { childList: true, subtree: true })
  document.addEventListener(
    'shopify:section:load',
    event => {
      event.target.querySelectorAll('[data-notify-host]').forEach(root => unloaded.delete(root))
      if (event.target.matches('[data-notify-host]')) unloaded.delete(event.target)
      refresh()
    },
    { signal: lifecycle.signal }
  )
  document.addEventListener(
    'shopify:section:unload',
    event => {
      for (const [root, cleanup] of owners) {
        if (event.target.contains(root)) {
          unloaded.add(root)
          cleanup()
          owners.delete(root)
        }
      }
      if (!owners.size) notify.destroyToaster()
    },
    { signal: lifecycle.signal }
  )
  window.addEventListener(
    'pagehide',
    event => {
      if (event.persisted) return
      lifecycle.abort()
      observer.disconnect()
      owners.forEach(cleanup => cleanup())
      owners.clear()
      notify.destroyToaster()
      delete window[key]
    },
    { signal: lifecycle.signal }
  )
  window[key] = true
  refresh()
})()
