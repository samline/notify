import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { compile } from 'svelte/compiler'
import { transform } from '@astrojs/compiler-rs'
const root = new URL('../shared/examples/frameworks/', import.meta.url)
const react = new URL('Notifications.tsx', root)
const program = ts.createProgram([react.pathname], {
  noEmit: true,
  strict: true,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  skipLibCheck: true,
  allowSyntheticDefaultImports: true,
})
const diagnostics = ts.getPreEmitDiagnostics(program)
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: p => p,
    getNewLine: () => '\n',
  })
)
const vue = parse(await readFile(new URL('Notifications.vue', root), 'utf8'))
assert.deepEqual(vue.errors, [])
compileScript(vue.descriptor, { id: 'notify-integration' })
assert.deepEqual(
  compileTemplate({
    source: vue.descriptor.template.content,
    filename: 'Notifications.vue',
    id: 'notify-integration',
  }).errors,
  []
)
const svelte = compile(await readFile(new URL('Notifications.svelte', root), 'utf8'), {
  filename: 'Notifications.svelte',
  generate: 'client',
})
assert.deepEqual(svelte.warnings, [])
await transform(await readFile(new URL('Notifications.astro', root), 'utf8'), {
  filename: 'Notifications.astro',
})
console.log(
  'React typecheck and Vue/Svelte/Astro compilation passed. CMS execution belongs to Chromium; no real hosted CMS deployment is implied.'
)

const prose = await readFile(new URL('../../docs/frameworks.md', import.meta.url), 'utf8')
const inlineVue = parse(prose.match(/```vue\n([\s\S]*?)\n```/)[1])
assert.deepEqual(inlineVue.errors, [])
assert.match(
  inlineVue.descriptor.scriptSetup.content,
  /import \{ onMounted, onUnmounted \} from 'vue'/
)
compileScript(inlineVue.descriptor, { id: 'notify-inline-integration' })
const inlineSvelte = compile(prose.match(/```svelte\n([\s\S]*?)\n```/)[1], {
  filename: 'InlineNotifications.svelte',
  generate: 'client',
})
assert.deepEqual(inlineSvelte.warnings, [])
console.log(
  'Canonical Vue and Svelte article snippets compile with their imports inside the component script.'
)
