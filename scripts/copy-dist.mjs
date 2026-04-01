import { cpSync, readFileSync, rmSync, copyFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

import { build } from 'esbuild'

const [, , sourceRoot, targetRoot] = process.argv

if (!sourceRoot || !targetRoot) {
  throw new Error('Usage: bun scripts/copy-dist.mjs <source-root> <target-root>')
}

const sourceDist = path.join(sourceRoot, 'dist')
const targetDist = path.join(targetRoot, 'dist')
const sourceStyles = path.join(sourceRoot, 'src', 'styles.css')
const targetStyles = path.join(targetDist, 'styles.css')
const sourceSrc = path.join(targetRoot, 'src')

rmSync(targetDist, { recursive: true, force: true })
cpSync(sourceDist, targetDist, { recursive: true })
copyFileSync(sourceStyles, targetStyles)

const injectedStyleAttribute = 'data-notify-runtime-styles'
const reactImportPattern = /^\s*(?:import\s+(?:.+\s+from\s+)?['"]react(?:-dom(?:\/client)?)?['"]|(?:var|const|let)\s+.+\s*=\s*require\(['"]react(?:-dom(?:\/client)?)?['"]\))/m

function toText(outputFile) {
  return new TextDecoder().decode(outputFile.contents)
}

function createStyleInjector(cssText) {
  if (!cssText.trim()) {
    return ''
  }

  return `(() => {
  if (typeof document === 'undefined') return;
  if (document.querySelector('style[${injectedStyleAttribute}]')) return;
  const style = document.createElement('style');
  style.setAttribute('${injectedStyleAttribute}', '');
  style.textContent = ${JSON.stringify(cssText)};
  (document.head || document.documentElement).appendChild(style);
})();\n`
}

async function bundleEntry({ entryPoint, outfile, format, external = [], globalName }) {
  const result = await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    write: false,
    format,
    globalName,
    external,
    platform: 'browser',
    target: ['es2020'],
    legalComments: 'none',
    logLevel: 'silent',
    jsx: 'transform',
    sourcemap: false,
  })

  const jsOutput = result.outputFiles.find((file) => path.resolve(file.path) === path.resolve(outfile))

  if (!jsOutput) {
    throw new Error(`Missing JS output for ${outfile}`)
  }

  const cssOutput = result.outputFiles.find((file) => file.path.endsWith('.css'))
  const cssText = cssOutput ? toText(cssOutput) : ''
  const code = `${createStyleInjector(cssText)}${toText(jsOutput)}`

  writeFileSync(outfile, code)
}

async function buildRuntimeBundles() {
  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'index.tsx'),
    outfile: path.join(targetDist, 'index.mjs'),
    format: 'esm',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'index.tsx'),
    outfile: path.join(targetDist, 'index.js'),
    format: 'cjs',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'svelte', 'index.ts'),
    outfile: path.join(targetDist, 'svelte', 'index.mjs'),
    format: 'esm',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'svelte', 'index.ts'),
    outfile: path.join(targetDist, 'svelte', 'index.js'),
    format: 'cjs',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'vue', 'index.ts'),
    outfile: path.join(targetDist, 'vue', 'index.mjs'),
    format: 'esm',
    external: ['vue'],
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'vue', 'index.ts'),
    outfile: path.join(targetDist, 'vue', 'index.js'),
    format: 'cjs',
    external: ['vue'],
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'browser', 'index.ts'),
    outfile: path.join(targetDist, 'browser', 'index.mjs'),
    format: 'esm',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'browser', 'index.ts'),
    outfile: path.join(targetDist, 'browser', 'index.cjs'),
    format: 'cjs',
  })

  await bundleEntry({
    entryPoint: path.join(sourceSrc, 'browser', 'index.ts'),
    outfile: path.join(targetDist, 'browser', 'index.js'),
    format: 'iife',
    globalName: '__samlineNotifyBrowser',
  })
}

function assertNoExternalReact(filePath) {
  const contents = readFileSync(filePath, 'utf8')

  if (reactImportPattern.test(contents)) {
    throw new Error(`Found external React import in ${filePath}`)
  }
}

function verifyBrowserGlobalBundle() {
  const code = readFileSync(path.join(targetDist, 'browser', 'index.js'), 'utf8')
  const windowObject = { window: null }

  windowObject.window = windowObject

  const sandbox = {
    window: windowObject,
    self: windowObject,
    global: windowObject,
    globalThis: windowObject,
    document: undefined,
    navigator: undefined,
    console,
    setTimeout,
    clearTimeout,
    queueMicrotask,
    requestAnimationFrame: undefined,
    cancelAnimationFrame: undefined,
  }

  vm.createContext(sandbox)
  vm.runInContext(code, sandbox)

  if (!sandbox.window.Notify || typeof sandbox.window.Notify.toast !== 'function') {
    throw new Error('Browser global bundle did not attach window.Notify')
  }
}

function verifyBundles() {
  const noReactFiles = [
    path.join(targetDist, 'index.js'),
    path.join(targetDist, 'index.mjs'),
    path.join(targetDist, 'svelte', 'index.js'),
    path.join(targetDist, 'svelte', 'index.mjs'),
    path.join(targetDist, 'vue', 'index.js'),
    path.join(targetDist, 'vue', 'index.mjs'),
    path.join(targetDist, 'browser', 'index.cjs'),
    path.join(targetDist, 'browser', 'index.mjs'),
    path.join(targetDist, 'browser', 'index.js'),
  ]

  noReactFiles.forEach(assertNoExternalReact)
  verifyBrowserGlobalBundle()
}

await buildRuntimeBundles()
verifyBundles()
