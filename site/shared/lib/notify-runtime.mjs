import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
// Develop and build this package's website against the owned checkout. Isolated
// adaptation fixtures have no package source and use the installed dependency.
const source = new URL('../../../src/index.ts', import.meta.url)
export const notifyAliases = existsSync(source)
  ? [
      { find: /^@samline\/notify$/, replacement: fileURLToPath(source) },
      {
        find: '@samline/notify/styles.css',
        replacement: fileURLToPath(new URL('../../../src/styles.css', import.meta.url)),
      },
    ]
  : []
