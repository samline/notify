import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

import { JSDOM } from 'jsdom'

const require = createRequire(import.meta.url)
const esm = await import('@samline/notify')
const cjs = require('@samline/notify')
const browserEsm = await import('@samline/notify/browser')
const browserCjs = require('@samline/notify/browser')

assert.equal(typeof esm.toast, 'function')
assert.equal(typeof cjs.toast, 'function')
assert.equal(typeof browserEsm.default.toast, 'function')
assert.equal(typeof browserCjs.default.toast, 'function')

const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
assert.match(css, /\[data-notify-toaster\]/)

const iife = await readFile(new URL('../dist/browser/global.global.js', import.meta.url), 'utf8')
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'dangerously' })
dom.window.eval(iife)
assert.equal(typeof dom.window.Notify?.toast, 'function')
assert.ok(dom.window.document.querySelector('[data-notify-toaster]'))
dom.window.Notify.destroyToaster()
dom.window.close()

const earlyDom = new JSDOM('<!doctype html><html><head></head></html>', {
  runScripts: 'dangerously'
})
const body = earlyDom.window.document.body
body.remove()
earlyDom.window.eval(iife)
assert.equal(earlyDom.window.document.querySelector('[data-notify-toaster]'), null)
earlyDom.window.document.documentElement.appendChild(body)
earlyDom.window.document.dispatchEvent(new earlyDom.window.Event('DOMContentLoaded'))
assert.ok(earlyDom.window.document.querySelector('[data-notify-toaster]'))
earlyDom.window.Notify.destroyToaster()
earlyDom.window.close()
