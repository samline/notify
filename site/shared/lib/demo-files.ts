import { format, resolveConfig } from 'prettier'
import ts from 'typescript'
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
// Specialize the same maintained integration to one scenario, so copied files
// do not contain seven unrelated action handlers. The browser tests execute it.
const behaviorFor = (preset: DemoPreset) => {
  const source = ts.createSourceFile(
    'demo.js',
    behavior,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS
  )
  const transform: ts.TransformerFactory<ts.SourceFile> = context => root => {
    const visit: ts.Visitor = node => {
      if (ts.isIfStatement(node) && node.expression.getText(source).startsWith('preset ===')) {
        let branch: ts.Statement | undefined = node
        while (branch && ts.isIfStatement(branch)) {
          if (branch.expression.getText(source) === `preset === '${preset}'`)
            return ts.visitNode(branch.thenStatement, visit)
          branch = branch.elseStatement
        }
        return branch ? ts.visitNode(branch, visit) : undefined
      }
      return ts.visitEachChild(node, visit, context)
    }
    return ts.visitNode(root, visit) as ts.SourceFile
  }
  const transformed = ts.transform(source, [transform])
  let specialized = transformed.transformed[0]
  // Remove unused helpers after choosing the scenario. Count references outside
  // the helper itself, so an otherwise-unused recursive retry helper is removed.
  for (;;) {
    let removed = false
    const prune: ts.TransformerFactory<ts.SourceFile> = context => root => {
      const visit: ts.Visitor = node => {
        if (ts.isVariableStatement(node) && node.declarationList.declarations.length === 1) {
          const declaration = node.declarationList.declarations[0]
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.name.text !== 'setupNotifyDemo' &&
            declaration.initializer &&
            ts.isArrowFunction(declaration.initializer)
          ) {
            let references = 0
            const count = (candidate: ts.Node) => {
              if (candidate === declaration.initializer || candidate === declaration.name) return
              if (ts.isIdentifier(candidate) && candidate.text === declaration.name.getText(source))
                references += 1
              ts.forEachChild(candidate, count)
            }
            count(root)
            if (!references) {
              removed = true
              return undefined
            }
          }
        }
        return ts.visitEachChild(node, visit, context)
      }
      return ts.visitNode(root, visit) as ts.SourceFile
    }
    const pruned = ts.transform(specialized, [prune])
    specialized = pruned.transformed[0]
    pruned.dispose()
    if (!removed) break
  }
  const result = ts.createPrinter({ removeComments: true }).printFile(specialized)
  transformed.dispose()
  return result.replace('export const setupNotifyDemo', 'const setupNotifyDemo')
}
export const createDemoFiles = async (preset: DemoPreset = 'save', mode: DemoMode = 'cdn') => {
  const css = cssFor(preset)
  const setup =
    mode === 'esm'
      ? `import { browser as notify } from '@samline/notify'\nimport '@samline/notify/styles.css'\n`
      : `// Published 3.2.0 wraps its registry in a namespace. New fixed builds expose it directly.\nconst notify = window.Notify.default ?? window.Notify\n`
  const behavior = behaviorFor(preset)
  const used = new Set(Array.from(behavior.matchAll(/copy\.(\w+)/g), match => match[1]))
  const copy = Object.fromEntries(Object.entries(messages).filter(([key]) => used.has(key)))
  const script = `${setup}\n${behavior}\nconst copy = ${JSON.stringify(copy)}\nconst demo = document.querySelector('[data-notify-demo]')\nconst cleanup = setupNotifyDemo(demo, notify, copy)\nwindow.addEventListener('pagehide', event => {\n if (!event.persisted) { cleanup(); notify.destroyToaster() }\n})\n`
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
