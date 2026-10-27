import sections from './sections'
import common from '../../../../../shared/i18n/translations/en/common'
import controls from '../../../../../shared/i18n/translations/en/controls'
import { project } from '../../../../../shared/lib/project.mjs'
export default {
  sections,
  common,
  controls,
  navigation: {
    mainLabel: 'Main navigation',
    skipContent: 'Skip to content',
    mobile: {
      title: `Explore ${project.name}`,
      introduction: 'One live demo, six ways to load it, and the reference when you need it.',
      resources: 'Around the package',
      label: 'Mobile navigation',
      open: 'Open navigation menu',
      close: 'Close navigation menu',
    },
    footer: {
      description: project.description,
      label: 'Footer navigation',
      explore: 'Explore',
      project: 'Package',
      setup: 'Installation guide',
      examples: 'Live examples',
      skill: 'Website adaptation skill',
      changelog: 'Changelog',
      backToTop: 'Back to top',
      credit: `${project.author} · Made for the open web.`,
    },
    items: [
      {
        href: '#features',
        label: 'Overview',
        description: 'What Notify does, and what it leaves to your app.',
      },
      {
        href: '#how',
        label: 'Get started',
        description: 'Install it and send your first toast.',
      },
      {
        href: '#recipes',
        label: 'Recipes',
        description: 'Async feedback, undo actions and toaster ownership.',
      },
      { href: '#faq', label: 'FAQ', description: 'Answers about docs, copying and releases.' },
      { page: 'examples', label: 'Examples', description: 'Run the live demo and copy its files.' },
      {
        docsRoute: 'overview',
        label: 'Docs',
        description: 'Read the guides and the complete reference.',
      },
    ],
  },
  examples: {
    exploreAction: 'Try the live demo',
    installAction: 'Installation guide',
    recipeEyebrow: '01 / A live interaction',
    eyebrow: 'Examples',
    title: `${project.name} examples.`,
    accent: 'examples.',
    description:
      'One live preview running the real package, with independently copyable files. The same demo appears on Home, on Examples and in the documentation.',
    possibilities:
      'This gallery shows a few of the flows Notify supports. The rest are yours to combine: pair the toast factory with your own content, your own layout and your own interactions, and build the notification experience your product actually needs.',
    guide: 'Read the example guide',
    navigation: 'Choose an example',
    accessibility:
      'Every control is a real button, every toast is announced by the package, and the copied files behave exactly like the preview.',
    skill: 'Download the website adaptation skill',
  },
} as const
