import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const migration = JSON.parse(
  await readFile(new URL('../brief/documentation-migration.json', import.meta.url), 'utf8')
)
assert.deepEqual(
  migration.unresolved,
  [],
  'Resolve every historical section before claiming complete migration.'
)
let sections = 0
for (const source of migration.sources) {
  assert.equal(source.reviewed, true, source.source)
  assert.match(source.revision, /^[a-f0-9]{40}$/)
  assert.match(source.sha256, /^[a-f0-9]{64}$/)
  for (const section of source.sections) {
    const [route, fragment] = section.destination.split('/#')
    const html = await readFile(
      new URL('../landing/dist/docs/' + route + '/index.html', import.meta.url),
      'utf8'
    )
    const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
    assert.ok(ids.has(fragment), `${source.source}#${section.fragment} -> ${section.destination}`)
    assert.ok(
      ids.has(section.fragment),
      `${source.source} lost public fragment #${section.fragment}`
    )
    sections += 1
  }
}
const home = await readFile(new URL('../landing/dist/index.html', import.meta.url), 'utf8')
for (const id of ['why-notify', 'choose-a-path', 'what-should-i-read-next'])
  assert.ok(home.includes(`id="${id}"`))
console.log(
  `Historical documentation verified: ${migration.sources.length} source articles, ${sections} sections, aliases and Home fragments.`
)
