# Troubleshooting

## Toasts do not appear

Mount the singleton with `createToaster()` after `document.body` exists. Toast calls still update state without a renderer, and destroying the toaster does not auto-remount it.

## Toasts look like a plain list

Import `@samline/notify/styles.css`, or load the matching `dist/styles.css` beside the IIFE. Check for 404 responses and mismatched JavaScript/CSS versions.

## Duplicate notifications or callbacks

Find multiple `mountToaster()` calls or framework effects mounted in several roots. Direct mounts share global state. Repeated `createToaster()` calls do not duplicate containers; they update the singleton.

## SSR or body-timing errors

Keep mounting out of module scope and run it in client lifecycle code. Imports are SSR-safe, DOM operations are not. The standalone IIFE waits for `DOMContentLoaded` when necessary.

## CDN global is undefined

- Verify the URL returns JavaScript rather than a 404 page.
- Load consumer code after the IIFE or wait for `DOMContentLoaded` when using `defer`.
- Check CSP and browser console errors.
- Pin a version that is actually published.

## Teardown, reset, and remount

`destroyToaster()` removes the singleton and requires an explicit later `createToaster()`. `resetToasts()` clears toast records while preserving the renderer. Low-level `resetToastState()` also drops subscribers, so advanced callers must destroy stale containers and remount.

## Strict CSP or custom visuals

The renderer writes inline layout properties; a CSP blocking style attributes can break placement. `unstyled: true` disables toast-body presentation, not renderer layout. Custom visuals must preserve focus, contrast, responsive behavior, and reduced motion.

See [Entrypoints](entrypoints.md), [CSS styling](css-styling.md), and [Framework integrations](frameworks.md).
