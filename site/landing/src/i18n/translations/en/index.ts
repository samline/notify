import sections from './sections'
import { footerCredit } from '../../../../../shared/lib/site-identity.mjs'
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
      introduction: 'Try a notification flow, find your setup, and explore the complete reference.',
      resources: 'Around the package',
      label: 'Mobile navigation',
      open: 'Open navigation menu',
      close: 'Close navigation menu',
    },
    footer: {
      description: project.description,
      label: 'Footer navigation',
      explore: 'Explore',
      project: 'Project',
      setup: 'Installation guide',
      examples: 'Working examples',
      skill: 'Notify skill for AI agents',
      changelog: 'Changelog',
      backToTop: 'Back to top',
      credit: footerCredit(project.credit),
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
    seoTitle: 'Examples',
    seoDescription:
      'Try notification flows and copy complete or separate HTML, CSS and JavaScript files for package imports or a standalone browser script.',
    accent: 'examples.',
    description:
      'Useful notification flows to try, understand and adapt. Every example includes the live package and complete HTML / CDN and Package / ESM source.',
    possibilities:
      'This gallery shows a few of the flows Notify supports. The rest are yours to combine: pair the toast factory with your own content, your own layout and your own interactions, and build the notification experience your product actually needs.',
    guide: 'Read the example guide',
    navigation: 'Choose an example',
    accessibility:
      'Read the outcome on the page as well as in the toast. Previews share one toaster; the active example controls its preferences. Keyboard, swipe and reduced-motion behavior come from Notify.',
    skill: 'Download the Notify integration skill',
  },
} as const
