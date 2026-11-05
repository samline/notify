import { project } from '../../../../../shared/lib/project.mjs'
const text = (value: string) => [{ kind: 'text' as const, value }]
const heading = (prefix: string, accent: string) => [
  { kind: 'text' as const, value: prefix + ' ' },
  { kind: 'emphasis' as const, value: accent },
]
const code = (filename: string, source: string, language: 'html' | 'javascript' | 'bash') => ({
  filename,
  code: source,
  language,
})
export const initialization = {
  esm: `import { createToaster, toast } from '@samline/notify'\nimport '@samline/notify/styles.css'\n\nconst toaster = createToaster({ richColors: true })\n\ndocument.querySelector('#save').addEventListener('click', () => {\n  toast.success('Changes saved')\n})`,
  cdn: `// Load the CDN stylesheet and script first.\nconst notify = window.Notify.default ?? window.Notify\nconst toaster = notify.createToaster({ richColors: true })\n\ndocument.querySelector('#save').addEventListener('click', () => {\n  notify.toast.success('Changes saved')\n})`,
}
export default {
  hero: {
    kicker: 'Small library. Clear feedback.',
    title: project.name,
    titleAccent: 'Keep people in the loop.',
    description: 'Toast notifications for the moments that matter.',
    descriptionContinuation: 'Confirm a save, follow a promise, or offer a way back.',
    footnotes: ['Zero runtime dependencies', 'JavaScript & TypeScript', 'MIT licensed'],
    compatibilityLabel: 'One small package. Right at home in your stack.',
    platforms: [
      'JavaScript',
      'TypeScript',
      'React',
      'Vue',
      'Svelte',
      'Astro',
      'Shopify',
      'WordPress',
    ],
  },
  features: {
    eyebrow: '01 / Feedback that fits',
    title: 'A small moment.',
    titleAccent: 'A clear next step.',
    items: {
      dependencies: {
        title: 'Just the package',
        description: text(
          'No framework runtime or peer dependency. Import the toast API and its stylesheet, then mount one renderer.'
        ),
      },
      accessibility: {
        title: 'Made to be read',
        description: text(
          'Polite live updates, keyboard controls and focus-paused timers. Your app chooses readable content, contrast and enough time to act.'
        ),
      },
      lifecycle: {
        title: 'One place to mount',
        description: text(
          'Create one toaster at your client root. Keep its controller to update preferences, and destroy it when the integration leaves.'
        ),
      },
      entrypoints: {
        title: 'Package or script tag',
        description: text(
          'Use ESM or CommonJS in your build, or a standalone browser script. The stylesheet is a separate asset in either setup.'
        ),
      },
      frameworks: {
        title: 'Your application, your flow',
        description: text(
          'Use the ordinary DOM API from React, Vue, Svelte, Astro or a CMS. No framework-specific component or adapter is required.'
        ),
      },
      markup: {
        title: 'More than a success message',
        description: text(
          'Follow cancelable work, chain review and decision actions, keep a live activity stack, or build an editable card with your own DOM.'
        ),
      },
    },
  },
  runtimes: {
    eyebrow: '02 / Fit it into your stack',
    heading: heading('Two ways in.', 'One toast API.'),
    description:
      'Choose package imports or a plain script tag. The module registry is optional; types and styles are supporting resources.',
    items: {
      main: {
        label: 'Package / ESM + CommonJS',
        entrypoint: '@samline/notify',
        description:
          'The toast factory, singleton lifecycle, types and advanced exports. Module imports do not install a global or mount a renderer.',
      },
      browser: {
        label: 'Optional module registry',
        entrypoint: '@samline/notify/browser',
        description:
          'The same singleton toast and toaster helpers collected in one object. This import does not create window.Notify.',
      },
      global: {
        label: 'HTML / CDN',
        entrypoint: 'window.Notify',
        description:
          'Load the standalone script and stylesheet. The script mounts a default toaster when the body is ready.',
      },
      style: {
        label: 'Styles',
        entrypoint: '@samline/notify/styles.css',
        description:
          'The required layout, stack, color and reduced-motion styles. Import once, then add your own CSS after the package stylesheet.',
      },
    },
  },
  gettingStarted: {
    eyebrow: '03 / From install to feedback',
    heading: heading('One button.', 'Your first toast.'),
    integrationDescription:
      'Install the package or load the CDN assets. Choose the matching initializer after the body is ready. Load main.js as a module for ESM, or with defer after the deferred CDN script.',
    integrationLabel: 'Read the installation guide',
    steps: { install: 'Load Notify', markup: 'Add a trigger', initialize: 'Mount and notify' },
    fullExampleLabel: 'Copy complete working files',
    markupDescription: 'Use a native button. Notify creates the notification markup for you.',
    examples: {
      markup: code('index.html', '<button id="save" type="button">Save changes</button>', 'html'),
      script: code('main.js', initialization.esm, 'javascript'),
    },
    docs: {
      description:
        'Mount once near the client root. The examples below continue with this toaster; complete standalone files are available in the guide.',
      label: 'Explore the configuration reference',
    },
  },
  recipes: {
    eyebrow: '04 / After the first toast',
    title: 'Keep the feedback useful.',
    titleAccent: 'Keep ownership clear.',
    description:
      'Continue from the instance above. Use the same toast id for progress, update the existing controller, and clean up when the application tears down.',
    examplesLabel: 'Try the complete working examples',
    items: [
      {
        title: 'Update a notification in place',
        context: 'Progress',
        docsRoute: 'api' as const,
        docsLabel: 'Read the toast API',
        description: text(
          'Keep the id returned by a loading toast. Replace its message and type when the task completes; loading itself has no automatic timeout.'
        ),
        code: code(
          'progress.js',
          `const id = toast.loading('Preparing your report…')\n\n// When your application finishes the work:\ntoast.success('Your report is ready', { id })`,
          'javascript'
        ),
      },
      {
        title: 'Change preferences without remounting',
        context: 'Controller',
        docsRoute: 'options' as const,
        docsLabel: 'Read the configuration reference',
        description: text(
          'Update the existing toaster when your theme or layout changes. Omitted options keep their current values.'
        ),
        code: code(
          'preferences.js',
          `toaster.update({\n  theme: 'dark',\n  position: 'top-right',\n  closeButton: true,\n})`,
          'javascript'
        ),
      },
      {
        title: 'Leave the page clean',
        context: 'Lifecycle',
        docsRoute: 'lifecycle' as const,
        docsLabel: 'Understand cleanup and remounting',
        description: text(
          'At application teardown, destroy the singleton and publish its dismissals. Mount again explicitly if the integration returns.'
        ),
        code: code(
          'cleanup.js',
          `import { destroyToaster } from '@samline/notify'\n\n// In your application or component cleanup:\ndestroyToaster()`,
          'javascript'
        ),
      },
    ],
  },
  faq: {
    eyebrow: '05 / Before you build',
    heading: heading('A few details.', 'Clearly answered.'),
    items: {
      mount: {
        question: text('Do I need a toaster before calling toast?'),
        answer: text(
          'Yes, for visible feedback. Module imports do not mount anything: call createToaster once after document.body exists. The standalone script auto-mounts once. Calling createToaster again updates the same singleton.'
        ),
      },
      frameworks: {
        question: text('Can I use it with my framework or CMS?'),
        answer: text(
          'Yes. Mount from the client lifecycle and load the stylesheet once. React, Vue, Svelte, Astro, Shopify and WordPress use the same DOM API; the integration guide explains cleanup and the limits of the CMS fixtures.'
        ),
      },
      promise: {
        question: text('What does toast.promise return?'),
        answer: text(
          'An object with unwrap(), plus an id when a loading message was supplied. unwrap preserves the input outcome. A fulfilled HTTP error response can show an error notification while unwrap still fulfills with that response.'
        ),
      },
      timer: {
        question: text('Will people have enough time to read or act?'),
        answer: text(
          'Timers pause on hover, keyboard focus and a hidden document. Choose a duration suited to the content. Use Infinity with a usable close action for persistent notices; keep essential errors and actions in the page too.'
        ),
      },
      style: {
        question: text('Can I change the design or supply my own content?'),
        answer: text(
          'Yes. Override CSS variables, add classes, or render your own DOM with toast.custom. The render callback receives the toast id and a dismiss() helper, and can return a cleanup function for its listeners.'
        ),
      },
      multiple: {
        question: text('Does each component need its own toaster?'),
        answer: text(
          'No. Mount one toaster near your application root and call toast() from anywhere. Every component shares the same queue, so there is nothing to pass around.'
        ),
      },
      accessible: {
        question: text('What accessibility work remains with my app?'),
        answer: text(
          'Notify supplies a polite live list, keyboard interaction and reduced-motion styles. You still own meaningful messages, contrast, timing, custom controls and testing with the assistive technologies your application supports.'
        ),
      },
    },
  },
  callToAction: {
    eyebrow: 'A little feedback goes a long way',
    heading: heading('Make the next step', 'a clear one.'),
    description: 'Try an interaction, then bring it into your application.',
    docs: {
      description: 'Installation, practical guides and the complete API for Notify.',
      label: 'Read the documentation',
    },
  },
} as const
