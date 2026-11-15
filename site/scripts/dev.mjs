import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
const { dev = {} } = JSON.parse(
  readFileSync(new URL('../project.config.json', import.meta.url), 'utf8')
)
const children = [
  ['landing', String(dev.landingPort ?? 4330)],
  ['docs', String(dev.docsPort ?? 4331)],
].map(([workspace, port]) =>
  spawn(
    'bun',
    ['run', '--cwd', workspace, 'dev', '--host', '127.0.0.1', '--port', port, '--ignore-lock'],
    { stdio: 'inherit' }
  )
)
let stopping = false
const stop = () => {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill('SIGTERM')
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, stop)
for (const child of children)
  child.on('exit', code => {
    if (!stopping) {
      process.exitCode = code ?? 1
      stop()
    }
  })
