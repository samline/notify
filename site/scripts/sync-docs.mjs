import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { format, resolveConfig } from 'prettier'
const root = new URL('../../', import.meta.url)
const map = JSON.parse(
  await readFile(new URL('../documentation-map.json', import.meta.url), 'utf8')
)
const migration = JSON.parse(
  await readFile(new URL('../brief/documentation-migration.json', import.meta.url), 'utf8')
)
const check = process.argv.includes('--check')
for (const entry of map) {
  let body = (await readFile(new URL(entry.source, root), 'utf8')).replace(/^# [^\n]+\n+/, '')
  // Markdown source paths become relative website routes, without a fixed base.
  body = body.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    if (/^(?:https?:|mailto:|#)/.test(target)) return whole
    if (target.endsWith('CHANGELOG.md'))
      return `](${path.posix.relative(entry.route || '.', 'changelog')}/)`
    const [file, fragment] = target.split('#')
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(entry.source), file))
    const destination = map.find(
      item => item.source === resolved || item.source === resolved + '/index.md'
    )
    if (!destination) return whole
    const relative = path.posix.relative(entry.route || '.', destination.route || '.') || '.'
    return `](${relative}/${fragment ? '#' + fragment : ''})`
  })
  const imports = []
  const ui = {
    installer: ['Installer', '../../../../shared/components/Installer.astro', '<Installer />'],
    starter: ['DemoCode', '../../../../shared/components/DemoCode.astro', '<DemoCode />'],
    playground: [
      'Playground',
      '../../../../../shared/components/Playground.astro',
      '<Playground showCode />',
    ],
    frameworks: [
      'FrameworkExamples',
      '../../../../../shared/components/FrameworkExamples.astro',
      '<FrameworkExamples label="Framework integration" groups={frameworkGroups} />',
    ],
  }
  // `<!-- notify:cards -->` turns the Markdown link list that follows it into
  // link cards on the website while GitHub keeps rendering the plain list.
  if (body.includes('<!-- notify:cards -->')) {
    imports.push(
      "import CardGrid from '../../../../shared/components/CardGrid.astro'",
      "import LinkCard from '../../../../shared/components/LinkCard.astro'"
    )
    body = body.replace(/<!-- notify:cards -->\n+((?:- .+\n?)+)/, (_, list) => {
      const cards = list
        .trim()
        .split('\n')
        .map(line => {
          const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\) — (.+)$/)
          if (!match) throw new Error(`Unsupported card line: ${line}`)
          const [, title, href, text] = match
          const html = text.replace(/`([^`]+)`/g, '<code>$1</code>')
          return `  <LinkCard href="${href}" title="${title}">\n    ${html}\n  </LinkCard>`
        })
      return `<CardGrid>\n${cards.join('\n')}\n</CardGrid>\n`
    })
  }
  // `<!-- notify:playground <preset> -->` shows one scenario with its code, so
  // Docs readers copy files without leaving Docs. GitHub ignores the comment.
  const presetMarker = /<!-- notify:playground ([a-z]+) -->/g
  if (presetMarker.test(body) && !body.includes('<!-- notify:playground -->'))
    imports.push("import Playground from '../../../../../shared/components/Playground.astro'")
  body = body.replace(presetMarker, '<Playground preset="$1" showCode />')
  for (const [key, [name, component, markup]] of Object.entries(ui)) {
    if (!body.includes(`<!-- notify:${key} -->`)) continue
    imports.push(`import ${name} from '${component}'`)
    if (key === 'frameworks')
      imports.push("import { frameworkGroups } from '../../../../../shared/lib/framework-files'")
    body = body.replaceAll(`<!-- notify:${key} -->`, markup)
  }
  // Aliases sit immediately before their useful semantic heading. They do not
  // create duplicate ToC entries or change heading typography/layout.
  const aliases = migration.aliases[entry.route] ?? {}
  let fence = false
  body = body
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('```')) fence = !fence
      if (fence || !/^#{2,6} /.test(line)) return line
      const slug = line
        .replace(/^#+ /, '')
        .replace(/`|\*/g, '')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_ -]/gu, '')
        .replaceAll(' ', '-')
      const ids = Object.entries(aliases)
        .filter(([, target]) => target === slug)
        .map(([id]) => `<span id="${id}" class="legacy-fragment" aria-hidden="true"></span>`)
      return ids.length ? ids.join('\n') + '\n\n' + line : line
    })
    .join('\n')
  const raw = `---\n${entry.frontmatter}\n---\n\n${imports.length ? imports.join('\n') + '\n\n' : ''}${body}`
  const destination = new URL('../' + entry.destination, import.meta.url)
  const expected = await format(raw, {
    ...(await resolveConfig(destination.pathname)),
    filepath: destination.pathname,
  })
  if (check)
    assert.equal(
      await readFile(destination, 'utf8'),
      expected,
      entry.source + ' is out of sync; run npm run sync:docs'
    )
  else await writeFile(destination, expected)
}
console.log(
  `${map.length} canonical Markdown sources ${check ? 'match' : 'synchronized with'} the website.`
)
