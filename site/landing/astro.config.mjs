import { legacyRoutes } from '../shared/lib/legacy-routes.mjs'
import { notifyAliases } from '../shared/lib/notify-runtime.mjs'
import { developmentRedirect } from '../shared/lib/development-routes.mjs'
import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import { inlineSmallStylesheets } from '../shared/lib/site-build.mjs'
import { project } from '../shared/lib/project.mjs'
const development = process.argv.includes('dev')
const docs = project.base + 'docs/'
// The previous documentation app published these routes at the site root.
// Keep the public URLs alive after the documentation moved under /docs/.
const redirects = Object.fromEntries(
  Object.entries(legacyRoutes).map(([from, to]) => ['/' + from, docs + to + '/'])
)

export default defineConfig({
  site: project.url,
  base: project.base === '/' ? '/' : project.base.slice(0, -1),
  output: 'static',
  trailingSlash: 'ignore',
  redirects,
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  vite: {
    resolve: { alias: notifyAliases },
    plugins: [
      tailwind(),
      developmentRedirect({ origin: 'http://127.0.0.1:4331', include: project.docsBase }),
    ],
    build: { assetsInlineLimit: inlineSmallStylesheets },
    define: { 'import.meta.env.BASE_URL': JSON.stringify(project.base) },
  },
})
