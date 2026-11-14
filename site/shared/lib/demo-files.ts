import { format, resolveConfig } from 'prettier'
import postcss from 'postcss'
import behavior from './demo-behavior.js?raw'
import css from './demo-styles.css?raw'
import { presets, messages, type DemoPreset } from '../i18n/translations/en/demo'
import { htmlFor } from './demo-source'
import controls from '../i18n/translations/en/controls'
import { project } from './project.mjs'
const options = await resolveConfig(process.cwd())
export type DemoMode = 'cdn' | 'esm'
const cssFor = (preset: DemoPreset) => {
  const sheet = postcss.parse(css)
  sheet.walkRules(rule => {
    const selectors = rule.selectors.filter(selector => {
      if (selector.includes('.notify-receipt')) return preset === 'custom'
      if (selector.includes('.notify-demo-select'))
        return ['position', 'stream', 'task'].includes(preset)
      if (selector.includes(' .btn-')) return false
      if (selector.includes('.notify-demo-feed') || selector.includes('.notify-demo-check'))
        return preset === 'stream'
      if (selector.includes('.notify-demo-output')) return preset === 'task'
      if (selector.includes('.notify-demo-fields'))
        return preset === 'stream' || preset === 'position'
      if (selector.includes('.notify-demo-field'))
        return ['save', 'upload', 'position', 'stream', 'task'].includes(preset)
      if (selector.includes('.notify-demo-item')) return preset === 'undo'
      return true
    })
    if (selectors.length) rule.selectors = selectors
    else rule.remove()
  })
  return sheet.toString()
}
// Copy one `#region` of demo-behavior.js, so the files match the live preview.
const region = (name: string) =>
  behavior
    .match(new RegExp(`// #region ${name}\\n([\\s\\S]*?)// #endregion ${name}`))![1]
    .replace(/^export /gm, '')
export const createDemoFiles = async (preset: DemoPreset = 'save', mode: DemoMode = 'cdn') => {
  const css = cssFor(preset)
  const setup =
    mode === 'esm'
      ? `import { browser as notify } from '@samline/notify'\nimport '@samline/notify/styles.css'\n`
      : `const notify = window.Notify\n`
  const scenario = region(preset)
  const used = new Set(Array.from(scenario.matchAll(/copy\.(\w+)/g), match => match[1]))
  const copy = Object.fromEntries(Object.entries(messages).filter(([key]) => used.has(key)))
  const helper = scenario.includes('wait(') ? `\n${region('wait')}` : ''
  const script = `${setup}
const copy = ${JSON.stringify(copy)}

${scenario}${helper}
${preset}Demo(document.querySelector('[data-notify-demo]'), notify, copy)

// A page that is leaving no longer needs its toaster.
window.addEventListener('pagehide', event => {
  if (!event.persisted) notify.destroyToaster()
})
`
  const documentFor = (separate: boolean) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${presets[preset].title}</title>
${mode === 'cdn' ? `<link rel="stylesheet" href="${project.delivery.cdnStylesheet}">` : ''}
${separate ? (mode === 'cdn' ? '<link rel="stylesheet" href="./style.css">' : '') : `<style>${css}</style>`}
</head><body><main style="max-width:48rem;margin:2rem auto;padding:1rem;font-family:system-ui,sans-serif">
${htmlFor(preset)}
</main>
${mode === 'cdn' ? `<script src="${project.delivery.cdnScript}"></script>` : ''}
${separate ? `<script${mode === 'esm' ? ' type="module"' : ''} src="./main.js"></script>` : `<script${mode === 'esm' ? ' type="module"' : ''}>${script}</script>`}
</body></html>`
  return {
    files: [
      {
        id: 'html',
        label: controls.codeFiles.html,
        filename: 'index.html',
        language: 'html' as const,
        code: await format(documentFor(true), { ...options, parser: 'html' }),
      },
      {
        id: 'css',
        label: controls.codeFiles.css,
        filename: 'style.css',
        language: 'css' as const,
        code: await format(css, { ...options, parser: 'css' }),
      },
      {
        id: 'javascript',
        label: controls.codeFiles.javascript,
        filename: 'main.js',
        language: 'javascript' as const,
        code: await format(
          mode === 'esm'
            ? script.replace(
                "import '@samline/notify/styles.css'\n",
                "import '@samline/notify/styles.css'\nimport './style.css'\n"
              )
            : script,
          {
            ...options,
            parser: 'babel',
          }
        ),
      },
    ],
    complete: { code: await format(documentFor(false), { ...options, parser: 'html' }) },
    markup: htmlFor(preset),
  }
}
export const demoFiles = createDemoFiles()
