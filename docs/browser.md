# Browser / CDN

Use the browser entry when you want the package to expose a global object.

## What it does

Loading the CDN build attaches `window.Notify` and auto-mounts a toaster in the document.

## Example

```html
<script src="https://unpkg.com/@samline/notify@2.0.0/dist/browser/index.js"></script>
<script>
  window.Notify.configureToaster({
    position: 'bottom-right',
    richColors: true,
  })

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#notify')?.addEventListener('click', () => {
      window.Notify.toast('Hello from the browser')
    })
  })
</script>
```

## Manual control

```ts
window.Notify.createToaster({
  position: 'top-center',
  duration: 3000,
})

const controller = window.Notify.getToaster()
controller?.update({ closeButton: true })
```

## When to use it

- You do not have a bundler.
- You want a small global API for demos or embed scenarios.
- You want to experiment quickly in plain HTML.
