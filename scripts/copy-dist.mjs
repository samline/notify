import { cpSync, rmSync, copyFileSync } from 'node:fs'
import path from 'node:path'

const [, , sourceRoot, targetRoot] = process.argv

if (!sourceRoot || !targetRoot) {
  throw new Error('Usage: bun scripts/copy-dist.mjs <source-root> <target-root>')
}

const sourceDist = path.join(sourceRoot, 'dist')
const targetDist = path.join(targetRoot, 'dist')
const sourceStyles = path.join(sourceRoot, 'src', 'styles.css')
const targetStyles = path.join(targetDist, 'styles.css')

rmSync(targetDist, { recursive: true, force: true })
cpSync(sourceDist, targetDist, { recursive: true })
copyFileSync(sourceStyles, targetStyles)