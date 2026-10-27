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
const redirects = {
  '/getting-started': docs + 'getting-started/',
  '/guides/toast-lifecycle': docs + 'guides/toast-lifecycle/',
  '/guides/actions-and-custom-content': docs + 'guides/actions-and-custom-content/',
  '/reference': docs + 'reference/api/',
  '/reference/accessibility': docs + 'guides/accessibility/',
  '/reference/api': docs + 'reference/api/',
  '/reference/browser': docs + 'reference/browser/',
  '/reference/configuration': docs + 'reference/configuration/',
  '/reference/css-styling': docs + 'reference/css-styling/',
  '/reference/entrypoints': docs + 'reference/entrypoints/',
  '/reference/examples': docs + 'guides/examples/',
  '/reference/frameworks': docs + 'guides/frameworks/',
  '/reference/promises': docs + 'reference/promises/',
  '/reference/troubleshooting': docs + 'reference/troubleshooting/',
  '/reference/typescript': docs + 'reference/typescript/',
}
export default defineConfig({
  site: project.url,
  base: project.base === '/' ? '/' : project.base.slice(0, -1),
  output: 'static',
  trailingSlash: 'ignore',
  redirects,
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [
      tailwind(),
      developmentRedirect({ origin: 'http://127.0.0.1:4331', include: project.docsBase }),
    ],
    build: { assetsInlineLimit: inlineSmallStylesheets },
    define: { 'import.meta.env.BASE_URL': JSON.stringify(project.base) },
  },
})
