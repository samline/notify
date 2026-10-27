import { demoFiles } from '../../../../../shared/lib/demo-files'
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
const source = await demoFiles
export default {
  hero: {
    kicker: 'Dependency-free toast notifications',
    title: project.name,
    titleAccent: 'Every outcome, announced.',
    description: project.description,
    descriptionContinuation: '',
    footnotes: [
      'No runtime dependencies',
      'ESM, CommonJS and browser builds',
      'Typed for TypeScript',
    ],
    compatibilityLabel: 'What the package ships',
    platforms: [
      'ESM and CommonJS builds',
      'Browser build, no bundler',
      'TypeScript types included',
    ],
  },
  features: {
    eyebrow: '01 / The package at a glance',
    title: 'Everything a toast needs.',
    titleAccent: 'Nothing it does not.',
    items: {
      dependencies: {
        title: 'The problem it solves',
        description: text(
          'A saved form, an uploaded file, a failed request: Notify turns each outcome into one typed call, with no runtime dependency to ship.'
        ),
      },
      accessibility: {
        title: 'Accessibility responsibilities',
        description: text(
          'Notify provides the live region, focusable toasts and keyboard controls. Your app still owns the wording, the timing and the contrast.'
        ),
      },
      lifecycle: {
        title: 'A clear lifecycle',
        description: text(
          'Mount one toaster, call the toast factory anywhere, update the options when the page changes, then destroy it on unmount.'
        ),
      },
      entrypoints: {
        title: 'Real entrypoints',
        description: text(
          'One API in six delivery modes: the ESM package, the CommonJS build, the browser registry, the standalone global, the public types and the stylesheet.'
        ),
      },
      frameworks: {
        title: 'Fits your workflow',
        description: text(
          'No React, Vue or Svelte component ships with the package. Mount the toaster from your client lifecycle and call toast from anywhere.'
        ),
      },
      markup: {
        title: 'Useful examples',
        description: text(
          'Four real flows run in the demo above: a success toast, an error toast, a promise that resolves, and a toast with an action.'
        ),
      },
    },
  },
  runtimes: {
    eyebrow: '02 / Choose your integration',
    heading: heading('One API.', 'Six ways to load it.'),
    description:
      'Every entrypoint exposes the same toast factory and the same toaster lifecycle. Pick the module format your build expects, or load the standalone bundle in a page with no bundler.',
    items: {
      main: {
        label: 'Package',
        entrypoint: '@samline/notify',
        description:
          'The main entrypoint for bundlers. The ESM and CommonJS builds export the toast factory, the toaster lifecycle, the public types and the numeric constants, and install no global.',
      },
      vanilla: {
        label: 'CommonJS',
        entrypoint: "require('@samline/notify')",
        description:
          'The same public surface in a CommonJS build, for Node scripts and bundlers that still consume CJS. It installs no global either.',
      },
      browser: {
        label: 'Browser registry',
        entrypoint: '@samline/notify/browser',
        description:
          'The importable browser registry: the same NotifyApi shape as a module-level singleton, for bundlers that want the browser ergonomics without a global.',
      },
      global: {
        label: 'Standalone build',
        entrypoint: 'window.Notify',
        description:
          'The standalone bundle registers a window.Notify global and mounts a default toaster, so a plain HTML page can send a toast with no bundler at all.',
      },
      core: {
        label: 'Types',
        entrypoint: 'Public TypeScript declarations',
        description:
          'Every public type is exported and typed: ToastOptions, ToasterOptions, ToastT, ToastId, Renderable, CustomContent and the promise result types.',
      },
      style: {
        label: 'Styles',
        entrypoint: '@samline/notify/styles.css',
        description:
          'The renderer expects the packaged stylesheet. Import it once at your entry point so the data-attribute contract resolves into the design you see.',
      },
    },
  },
  gettingStarted: {
    eyebrow: '03 / From install to interaction',
    heading: heading('Three steps.', 'A real toast.'),
    integrationDescription:
      'Notify installs as one dependency-free package. Import the toast factory and the stylesheet, mount a single toaster at your entry point, and every call renders in the same place.',
    integrationLabel: 'Read the getting started guide',
    steps: {
      install: 'Install the package',
      markup: 'Add the triggers',
      initialize: 'Send a toast',
    },
    installLabel: 'Choose your package manager',
    installTabs: [
      { id: 'npm', label: 'npm', code: `npm install ${project.npmName}` },
      { id: 'pnpm', label: 'pnpm', code: `pnpm add ${project.npmName}` },
      { id: 'yarn', label: 'yarn', code: `yarn add ${project.npmName}` },
      { id: 'bun', label: 'bun', code: `bun add ${project.npmName}` },
    ],
    fullExampleLabel: 'Copy the complete example files',
    markupDescription:
      'The markup only marks where the user acts. Notify renders the toast itself, in the corner of the viewport, with its own stylesheet.',
    examples: {
      markup: code('index.html', source.markup, 'html'),
      script: code('main.js', source.files[2].code, 'javascript'),
    },
    docs: {
      description:
        'Continue with the option reference when you need to change the position, the theme, the duration or the stylesheet variables.',
      label: 'Explore the configuration reference',
    },
  },
  recipes: {
    eyebrow: '04 / Useful patterns',
    title: 'Three real flows.',
    titleAccent: 'Copy them as they are.',
    description:
      'Each recipe solves one task you will meet in a real app. The code is the API you would write, not a mock-up.',
    examplesLabel: 'Explore the live examples',
    items: [
      {
        title: 'Report a failed request',
        context: 'Async feedback',
        docsRoute: 'api' as const,
        docsLabel: 'Read the toast reference',
        description: text(
          'A rejected request is not a console error. toast.promise ties the loading, success and error states to one id, so the same toast updates in place.'
        ),
        code: code(
          'toast-promise.js',
          `import { createToaster, toast } from '@samline/notify'

createToaster({
  position: 'bottom-right',
  richColors: true,
  theme: 'system'
})

toast.promise(saveProfile(patch), {
  loading: 'Saving profile…',
  success: profile => \`Saved as \${profile.name}\`,
  error: 'Could not save your profile'
})`,
          'javascript'
        ),
      },
      {
        title: 'Undo a destructive action',
        context: 'Recoverable steps',
        docsRoute: 'options' as const,
        docsLabel: 'Read the option reference',
        description: text(
          'Deleting something deserves a way back. The action option renders a native button inside the toast, and the toast stays on screen long enough to use it.'
        ),
        code: code(
          'toast-action.js',
          `import { createToaster, toast } from '@samline/notify'

createToaster({
  position: 'bottom-right',
  richColors: true,
  theme: 'system'
})

toast('Message archived', {
  type: 'action',
  duration: 8000,
  action: {
    label: 'Undo',
    onClick: () => restoreMessage(id)
  }
})`,
          'javascript'
        ),
      },
      {
        title: 'Own the toaster in one place',
        context: 'Lifecycle',
        docsRoute: 'lifecycle' as const,
        docsLabel: 'Read the configuration reference',
        description: text(
          'Mount the singleton once at your app entry and destroy it when the view unmounts. createToaster is idempotent, so a second call updates the same toaster instead of duplicating it.'
        ),
        code: code(
          'toaster-lifecycle.js',
          `import { createToaster, destroyToaster, toast } from '@samline/notify'

const toaster = createToaster({
  position: 'bottom-right',
  richColors: true,
  theme: 'system'
})

toast.success('Changes saved')

toaster.update({ duration: 8000 })

// When the view unmounts:
destroyToaster()`,
          'javascript'
        ),
      },
    ],
  },
  faq: {
    eyebrow: '05 / Before you build',
    heading: heading('A few details.', 'Clearly answered.'),
    items: {
      docs: {
        question: text('Where is the full documentation?'),
        answer: text(
          'The documentation site holds the guides, the complete option reference and one page per public method. It is updated in the same release as the package.'
        ),
      },
      copy: {
        question: text('Can I copy the examples?'),
        answer: text(
          'Yes. Each example is copyable as separate files or as one complete document. The complete document loads Notify from the published CDN build, so it runs by opening index.html with no install and no build step.'
        ),
      },
      changes: {
        question: text('How are changes documented?'),
        answer: text(
          'One changelog lists every release and marks the breaking ones. New options and methods appear in the API reference before the version that ships them is published.'
        ),
      },
    },
  },
  callToAction: {
    eyebrow: 'Build with Notify',
    heading: heading('Ready for the details?', 'Start here.'),
    description: 'Install the package, or look up the exact option you need.',
    docs: {
      description: 'Guides, the full option reference and one page per public method.',
      label: 'Read the documentation',
    },
  },
} as const
