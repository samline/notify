import { defineConfig } from '@playwright/test'
import { project } from './shared/lib/project.mjs'
const requested = Number(process.env.PACKAGE_SITE_TEST_PORT ?? 4338)
if (!Number.isInteger(requested) || requested < 1024 || requested > 65535)
  throw new Error('PACKAGE_SITE_TEST_PORT must be an integer between 1024 and 65535')
const origin = `http://127.0.0.1:${requested}`
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 60000,
  use: { baseURL: origin + project.base, browserName: 'chromium' },
  webServer: {
    command: `npm run preview --workspace landing -- --host 127.0.0.1 --port ${requested} --ignore-lock`,
    url: origin + project.base,
    reuseExistingServer: false,
  },
})
