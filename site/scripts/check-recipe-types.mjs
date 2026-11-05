import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

// Recipes are explicit application continuations. Check their Notify API use
// against the owned source while allowing unresolved app placeholders such as
// uploadFile, router and logEvent. Do not replace the package types with any.
const articles = await Promise.all(
  ['../../docs/recipes.md', '../../README.md'].map(path =>
    readFile(new URL(path, import.meta.url), 'utf8')
  )
)
const snippets = articles.flatMap(article => [...article.matchAll(/```ts\n([\s\S]*?)\n```/g)])
const values = [
  'toast',
  'createToaster',
  'destroyToaster',
  'getToaster',
  'mountToaster',
  'resetToasts',
  'ToastState',
]
const types = ['ToastT', 'ToastToDismiss']
const files = new Map()
const options = {
  noEmit: true,
  strict: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  paths: { '@samline/notify': [fileURLToPath(new URL('../../src/index.ts', import.meta.url))] },
}
for (const [index, match] of snippets.entries()) {
  const filename = fileURLToPath(new URL(`../.notify-recipe-${index + 1}.ts`, import.meta.url))
  const original = ts.createSourceFile(filename, match[1], ts.ScriptTarget.Latest, true)
  const imported = new Set()
  for (const node of original.statements) {
    if (!ts.isImportDeclaration(node)) continue
    const bindings = node.importClause?.namedBindings
    if (bindings && ts.isNamedImports(bindings))
      for (const element of bindings.elements) imported.add(element.name.text)
  }
  const imports = [
    `import { ${values.filter(name => !imported.has(name)).join(', ')} } from '@samline/notify'`,
    `import type { ${types.filter(name => !imported.has(name)).join(', ')} } from '@samline/notify'`,
  ].filter(line => !line.includes('{  }'))
  const source = imports.join('\n') + '\n' + match[1] + '\nexport {}\n'
  files.set(filename, source)
}
const host = ts.createCompilerHost(options)
const read = host.readFile.bind(host)
host.readFile = name => files.get(name) ?? read(name)
const exists = host.fileExists.bind(host)
host.fileExists = name => files.has(name) || exists(name)
const program = ts.createProgram([...files.keys()], options, host)
const diagnostics = ts
  .getPreEmitDiagnostics(program)
  .filter(item => !(item.file && files.has(item.file.fileName) && [2304, 2552].includes(item.code)))
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => process.cwd(),
    getCanonicalFileName: name => name,
    getNewLine: () => '\n',
  })
)
// Fail if module resolution ever silently removes the package's type checking.
for (const filename of files.keys()) {
  const file = program.getSourceFile(filename)
  const imported = file.statements.find(
    node => ts.isImportDeclaration(node) && node.importClause?.namedBindings
  )
  const binding = imported.importClause.namedBindings.elements[0]
  const type = program.getTypeChecker().getTypeAtLocation(binding.name)
  assert.equal(Boolean(type.flags & ts.TypeFlags.Any), false, `${filename}: unresolved API types`)
}
console.log(
  `${snippets.length} recipe and README continuations checked against the real Notify types; application placeholders remain external.`
)
