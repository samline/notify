import react from '../examples/frameworks/Notifications.tsx?raw'
import vue from '../examples/frameworks/Notifications.vue?raw'
import svelte from '../examples/frameworks/Notifications.svelte?raw'
import astro from '../examples/frameworks/Notifications.astro?raw'
import liquid from '../examples/frameworks/notify.liquid?raw'
import php from '../examples/frameworks/notify.php?raw'
import hosts from '../examples/frameworks/notify-hosts.js?raw'
const file = (filename: string, code: string, language: string) => ({
  id: filename.replaceAll('.', '-'),
  label: filename,
  filename,
  code,
  language,
})
export const frameworkGroups = [
  { id: 'react', label: 'React', files: [file('Notifications.tsx', react, 'tsx')] },
  { id: 'vue', label: 'Vue', files: [file('Notifications.vue', vue, 'vue')] },
  { id: 'svelte', label: 'Svelte', files: [file('Notifications.svelte', svelte, 'svelte')] },
  { id: 'astro', label: 'Astro', files: [file('Notifications.astro', astro, 'astro')] },
  {
    id: 'shopify',
    label: 'Shopify',
    files: [file('notify.liquid', liquid, 'liquid'), file('notify-hosts.js', hosts, 'javascript')],
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    files: [file('notify.php', php, 'php'), file('notify-hosts.js', hosts, 'javascript')],
  },
]
