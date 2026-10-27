import { format, resolveConfig } from 'prettier'
import demo from '../i18n/translations/en/demo'
import controls from '../i18n/translations/en/controls'
import { project } from './project.mjs'

// Read formatting options once at build time. Both consumers share the same files.
const options = await resolveConfig(process.cwd())
// The copied example runs without a build step, so it loads the published
// browser build and the packaged stylesheet from the CDN. Both URLs come
// from project.config.json so the example, the installer and the landing
// always point at the same pinned release.
const cdnStylesheet = project.delivery.cdnStylesheet
const cdnScript = project.delivery.cdnScript
if (!cdnStylesheet || !cdnScript) {
  throw new Error('project.delivery must publish the CDN stylesheet and script for the demo')
}
const documentFor = (separate: boolean) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${demo.label}</title>
<link rel="stylesheet" href="${cdnStylesheet}">

${separate ? '<link rel="stylesheet" href="./style.css">' : `<style>\n${demo.css}\n</style>`}
</head>

<body>
<main>
${demo.html}
</main>

<script src="${cdnScript}"></script>
${separate ? '<script src="./main.js"></script>' : `<script>\n${demo.javascript}\n</script>`}
</body>
</html>`

const createDemoFiles = async () => ({
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
      code: await format(demo.css, { ...options, parser: 'css' }),
    },
    {
      id: 'javascript',
      label: controls.codeFiles.javascript,
      filename: 'main.js',
      language: 'javascript' as const,
      code: await format(demo.javascript, { ...options, parser: 'babel' }),
    },
  ],
  complete: { code: await format(documentFor(false), { ...options, parser: 'html' }) },
  markup: await format(demo.html, { ...options, parser: 'html' }),
})
export const demoFiles = createDemoFiles()
