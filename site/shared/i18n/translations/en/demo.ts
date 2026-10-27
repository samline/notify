import { project } from '../../../lib/project.mjs'
export default {
  title: 'Four notification flows',
  tabs: [
    { id: 'preview', label: 'Preview' },
    { id: 'html', label: 'HTML' },
    { id: 'javascript', label: 'JavaScript' },
  ],
  previewTagline: 'Live @samline/notify runtime',
  description:
    'Every button runs the real package: a success toast, an error toast, a promise that resolves, and a toast with an action. Toasts render in the corner of the viewport.',
  label: 'Notify demo',
  increment: 'Show success',
  reset: 'Show error',
  promise: 'Run promise flow',
  action: 'Toast with action',
  count: 'Active toasts',
  noscript:
    'Enable JavaScript to run the demo. The copied source files stay readable in the tabs and in the code below.',
  openCode: 'Explore the code',
  note: 'Save the three files in one folder and open index.html. The complete file is the same example in a single document. Both load Notify from the published CDN build, so no install and no build step are needed.',
  copyComplete: 'Copy the complete example',
  html: `<section class="notify-demo" aria-label="Notify demo">
  <h2 class="notify-demo-title">Notify in four steps</h2>
  <p class="notify-demo-copy">
    Every button sends a real toast through <code>@samline/notify</code>.
  </p>
  <div class="notify-demo-actions">
    <button type="button" data-success>Show success</button>
    <button type="button" data-error>Show error</button>
    <button type="button" data-promise>Run promise flow</button>
    <button type="button" data-action>Toast with action</button>
  </div>
</section>`,
  css: `.notify-demo {
  display: grid;
  gap: 1rem;
  max-width: 40rem;
  padding: 2rem;
  border: 0.0625rem solid #c6bdcf;
  border-radius: 1rem;
  font: 1rem/1.6 system-ui, sans-serif;
}
.notify-demo-title {
  margin: 0;
  font-size: 1.25rem;
}
.notify-demo-copy {
  margin: 0;
  color: #57534f;
}
.notify-demo-copy code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
}
.notify-demo-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.notify-demo-actions button {
  padding: 0.75rem 1rem;
  border: 0.0625rem solid #c6bdcf;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1c1917;
  font: inherit;
  cursor: pointer;
}
.notify-demo-actions button:hover {
  border-color: ${project.accentLight};
  color: ${project.accentLight};
}
.notify-demo-actions button:focus-visible {
  outline: 0.125rem solid ${project.accentLight};
  outline-offset: 0.1875rem;
}`,
  javascript: `// The standalone build registers \`window.Notify\`; its default export is the registry.
const notify = window.Notify?.default ?? window.Notify
const demo = document.querySelector('.notify-demo')

if (demo) {
  const lifecycle = new AbortController()
  const { signal } = lifecycle

  // Mount one toaster before sending any toast.
  notify.createToaster({
    position: 'bottom-right',
    richColors: true,
    theme: 'system'
  })

  demo.querySelector('[data-success]').addEventListener(
    'click',
    () => {
      notify.toast.success('Saved', {
        description: 'Your changes are live.'
      })
    },
    { signal }
  )

  demo.querySelector('[data-error]').addEventListener(
    'click',
    () => {
      notify.toast.error('Could not save', {
        description: 'The server rejected the request.'
      })
    },
    { signal }
  )

  demo.querySelector('[data-promise]').addEventListener(
    'click',
    () => {
      notify.toast.promise(
        new Promise(resolve => setTimeout(() => resolve('Q3'), 1800)),
        {
          loading: 'Generating the report…',
          success: name => \`Report \${name} is ready\`,
          error: 'The report could not be generated'
        }
      )
    },
    { signal }
  )

  demo.querySelector('[data-action]').addEventListener(
    'click',
    () => {
      notify.toast('Message archived', {
        type: 'action',
        duration: 8000,
        action: {
          label: 'Undo',
          onClick: () => {
            notify.toast.success('Archive undone')
          }
        }
      })
    },
    { signal }
  )

  window.addEventListener(
    'pagehide',
    event => {
      if (!event.persisted) {
        lifecycle.abort()
        notify.destroyToaster()
      }
    },
    { signal }
  )
}`,
} as const
