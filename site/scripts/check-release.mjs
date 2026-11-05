import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { project } from '../shared/lib/project.mjs'
const audit = JSON.parse(await readFile(new URL('../content-audit.json', import.meta.url), 'utf8'))
assert.equal(
  project.template,
  false,
  'Set site.template=false only after replacing the starter content.'
)
assert.equal(audit.status, 'verified', 'Complete the source/API content audit before publishing.')
assert.equal(
  audit.packageVersion,
  project.version,
  'Reconcile documentation with the current version.'
)
assert.equal(
  audit.themeReview?.status,
  'verified',
  'Confirm the maintainer’s accent preference before release.'
)
assert.ok(audit.themeReview.source?.trim(), 'Record where the theme preference came from.')
assert.equal(audit.themeReview.accentLight, project.accentLight, 'Review the actual light accent.')
assert.equal(audit.themeReview.accentDark, project.accentDark, 'Review the actual dark accent.')
assert.equal(
  audit.capabilityReview?.status,
  'verified',
  'Review supported integrations, distinct use cases and onboarding depth.'
)
for (const group of ['integrations', 'scenarios']) {
  assert.ok(
    audit.capabilityReview[group].length,
    `Inventory real ${group}; a copied starter is not evidence.`
  )
  for (const item of audit.capabilityReview[group]) {
    assert.ok(
      item.name && item.evidence && item.destination && item.reviewed === true,
      `Review each ${group} entry with source and a useful destination.`
    )
    await readFile(new URL('../' + item.destination, import.meta.url))
  }
}
assert.equal(
  audit.capabilityReview.onboarding?.equivalentModes,
  true,
  'Keep initialization modes comparable; put full documents in a separate file viewer.'
)
assert.ok(audit.sources.length > 0, 'Inventory the existing documentation and source.')
for (const item of [...audit.sources, ...audit.publicExports]) {
  assert.ok(
    item.source && item.destination && item.reviewed === true,
    'Every audited entry needs source, destination and explicit review.'
  )
  const destination = new URL('../' + item.destination, import.meta.url)
  assert.ok(
    destination.pathname.startsWith(new URL('../', import.meta.url).pathname),
    'Audit destinations must stay inside this project.'
  )
  await readFile(destination)
}

assert.equal(audit.migrationReview?.status, 'verified')
assert.equal(audit.migrationReview?.unresolved, 0)
assert.equal(audit.editorialReview?.status, 'verified')
for (const source of audit.sources.filter(item => !item.revision)) {
  const bytes = await readFile(new URL('../../' + source.source, import.meta.url))
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    source.sha256,
    `Source changed since review: ${source.source}`
  )
}

assert.equal(audit.secondPass?.status, 'verified', 'Complete the second-pass validation.')
assert.equal(audit.visualReview?.status, 'verified', 'Complete the controls and visual review.')
assert.ok(audit.visualReview.sources?.length, 'Record the actual controls reviewed.')
for (const item of audit.visualReview.sources) {
  assert.ok(item.source.startsWith('shared/'), 'Visual sources belong to the shared site UI.')
  const bytes = await readFile(new URL('../' + item.source, import.meta.url))
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    item.sha256,
    `Visual source changed since review: ${item.source}`
  )
}

console.log(
  'Release inventory and reviewed source hashes are current. Local checks do not publish the package or site.'
)
