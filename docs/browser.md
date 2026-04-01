# Browser / CDN

Use the browser entry when you want the package to expose a global object.

## What it does

Importing `@samline/sonner/browser` attaches `window.Sonner` and auto-mounts a toaster in the document.

## Example

```html
<script type="module">
  import 'https://unpkg.com/@samline/sonner@2.0.7/dist/browser/index.js'

  window.Sonner.configureToaster({
    position: 'bottom-right',
    richColors: true,
  })

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#notify')?.addEventListener('click', () => {
      window.Sonner.toast('Hello from the browser')
    })
  })
</script>
```

## Manual control

```ts
window.Sonner.createToaster({
  position: 'top-center',
  duration: 3000,
})

const controller = window.Sonner.getToaster()
controller?.update({ closeButton: true })
```

## When to use it

- You do not have a bundler.
- You want a small global API for demos or embed scenarios.
- You want to experiment quickly in plain HTML.
