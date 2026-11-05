import { legacyRoutes } from '../shared/lib/legacy-routes.mjs'
import { project } from '../shared/lib/project.mjs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
await cp(
  new URL('../docs/dist/', import.meta.url),
  new URL('../landing/dist/docs/', import.meta.url),
  { recursive: true }
)
const index = new URL('../landing/dist/sitemap-index.xml', import.meta.url)
const [landing, docs] = await Promise.all([
  readFile(index, 'utf8'),
  readFile(new URL('../docs/dist/sitemap-index.xml', import.meta.url), 'utf8'),
])
await writeFile(
  index,
  landing.replace(
    '</sitemapindex>',
    (docs.match(/<sitemap>.*?<\/sitemap>/g) ?? []).join('') + '</sitemapindex>'
  )
)
await writeFile(new URL('../landing/dist/.nojekyll', import.meta.url), '')
console.log('Combined landing, examples, docs, search, fonts and sitemap into landing/dist.')

// Static hosting cannot issue server redirects. Preserve both query and hash;
// aliases in the destination preserve every inventoried historical section.
for (const [from, to] of Object.entries(legacyRoutes)) {
  const target = project.docsBase + to + '/'
  const directory = new URL('../landing/dist/' + from + '/', import.meta.url)
  await mkdir(directory, { recursive: true })
  await writeFile(
    new URL('index.html', directory),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Documentation moved</title><link rel="canonical" href="${new URL(target, project.origin).href}"><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script><noscript><meta http-equiv="refresh" content="0;url=${target}"></noscript></head><body><p>This article has moved. <a href="${target}">Read the documentation</a>.</p></body></html>`
  )
}
