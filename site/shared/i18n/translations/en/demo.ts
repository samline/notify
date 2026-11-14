export const presets = {
  save: {
    title: 'A save worth confirming',
    label: 'Save changes',
    eyebrow: 'Profile settings',
    heading: 'A little more like you.',
    description: 'Update your public display name. Nothing leaves this page.',
    action: 'Save changes',
    note: 'A loading notification becomes a success on the same id. The saved name stays visible in the form.',
    initial: 'Your profile is up to date.',
    field: 'Display name',
    value: 'Nora Quinn',
  },
  retry: {
    title: 'Give a failed request a way back',
    label: 'Error and retry',
    eyebrow: 'Report delivery',
    heading: 'Your report, ready to send.',
    description: 'Send the October report. The first simulated request fails; retrying succeeds.',
    action: 'Send report',
    note: 'An error stays available with a real Retry action. Retry changes the local delivery receipt.',
    initial: 'October report · Not sent',
  },
  upload: {
    title: 'One upload. One notification.',
    label: 'Progress updates',
    eyebrow: 'Asset library',
    heading: 'Make room for the next idea.',
    description: 'Upload campaign-cover.jpg, a 2.4 MB sample asset. Progress is simulated locally.',
    action: 'Upload sample',
    note: 'A manual loading toast updates by id, then becomes success. Repeated clicks cannot start overlapping uploads.',
    initial: 'campaign-cover.jpg · Ready',
  },
  undo: {
    title: 'Undo that actually restores the item',
    label: 'Undo archive',
    eyebrow: 'Team inbox',
    heading: 'Keep a clear inbox.',
    description:
      'Archive the launch checklist. Use Undo in the notification to bring the same item back.',
    action: 'Archive checklist',
    note: 'The toast action restores the item in the page. Archiving is a local preview, not a connected inbox.',
    initial: 'Launch checklist · In your inbox',
  },
  persistent: {
    title: 'Keep the important details within reach',
    label: 'Persistent notice',
    eyebrow: 'Workspace access',
    heading: 'An invitation waiting for you.',
    description:
      'Keep an invitation notice open while you read. Its details also remain on the page.',
    action: 'Show invitation',
    note: 'duration: Infinity leaves time to read. A native close button and an explicit dismiss action keep the notice under your control.',
    initial: 'Studio workspace · Invitation available',
  },
  custom: {
    title: 'Your content. Notify’s lifecycle.',
    label: 'Custom content',
    eyebrow: 'Release desk',
    heading: 'A release ready for review.',
    description:
      'Open a release card, write a note inside the notification and save it back to the page. Your integration owns the DOM and appearance.',
    action: 'Show release receipt',
    note: 'toast.custom uses safe DOM construction. Your integration supplies the custom appearance and close action.',
    initial: 'Release 4.0.0 · Ready for review',
  },
  position: {
    title: 'Change the setting, keep the controller',
    label: 'Theme and position',
    eyebrow: 'Notification preferences',
    heading: 'Put feedback where it belongs.',
    description:
      'Choose position, theme and reading direction. Preview the same notification, then apply changes while it is still open.',
    action: 'Preview preference',
    note: 'update() preserves omitted settings. Corner toasts swipe toward their edges; centered toasts swipe vertically.',
    initial: 'Bottom right · Follows the page theme',
  },
  history: {
    title: 'Dismiss the toast. Keep the receipt.',
    label: 'Active and history',
    eyebrow: 'Activity log',
    heading: 'A useful record of what happened.',
    description:
      'Create a local activity entry, dismiss its notification, then compare the active state and history.',
    action: 'Add activity',
    note: 'getToasts() excludes dismissed records. getHistory() keeps the latest record for each id until reset, not an append-only event log.',
    initial: 'No activity in this preview yet.',
  },
  decisions: {
    title: 'An action can begin a conversation',
    label: 'Review and decide',
    eyebrow: 'Workspace invitation',
    heading: 'The right access, before you join.',
    description:
      'Review an Editor invitation to Studio. Read its permissions, then join or choose Not now. This is a local decision preview.',
    action: 'Review invitation',
    initial: 'Studio · Editor invitation pending',
    note: 'action and cancel offer two real outcomes. closeOnClick: false keeps the same notification alive while Review becomes Join. A notification supports a lightweight choice; use a dialog for a blocking decision.',
  },
  stream: {
    title: 'A busy workspace. A readable stack.',
    label: 'Live activity stack',
    eyebrow: 'Studio activity',
    heading: 'Catch up without losing your place.',
    description:
      'Play a local sequence of uploads, comments and transfer alerts. The page retains the feed while notifications stack, expire or are dismissed.',
    action: 'Play workspace activity',
    initial: 'No new workspace activity.',
    note: 'Normal, success, info, warning and error messages share one stack. Change its visible limit and expansion live. Hover or focus to pause a timer, use Alt+T from outside a field, or swipe a corner notification. Auto-close and manual dismissal are counted separately.',
  },
  task: {
    title: 'A promise with a result you can use',
    label: 'Cancelable CSV export',
    eyebrow: 'Reports',
    heading: 'Your numbers, ready to take with you.',
    description:
      'Generate a small CSV from local sample data. Try success, a simulated server error, or cancel the pending operation. No request leaves this page.',
    action: 'Generate CSV',
    initial: 'October report · Ready to export',
    note: 'toast.promise follows the operation; unwrap() gives the original result to your application. An AbortController cancels the work. finally releases the form in every outcome. Notify does not cancel requests for you.',
  },
} as const
export type DemoPreset = keyof typeof presets

type Diagram = {
  position:
    'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right' | 'top-left' | 'top-center'
  type: 'normal' | 'success' | 'error' | 'info' | 'warning' | 'loading' | 'custom'
  description?: boolean
  actions: number
  stack: number
  close?: boolean
  progress?: boolean
  ghost?: boolean
}
const diagram = (shape: Partial<Diagram> & Pick<Diagram, 'type'>): Diagram => ({
  position: 'bottom-right',
  actions: 0,
  stack: 1,
  description: true,
  ...shape,
})
/** Schematic of the notification each preset produces (decorative). */
export const diagrams: Record<DemoPreset, Diagram> = {
  save: diagram({ type: 'success' }),
  retry: diagram({ type: 'error', actions: 1 }),
  upload: diagram({ type: 'loading', description: false, progress: true }),
  undo: diagram({ type: 'normal', actions: 1 }),
  persistent: diagram({ type: 'info', actions: 1, close: true }),
  custom: diagram({ type: 'custom', actions: 1 }),
  position: diagram({ type: 'normal', position: 'top-center' }),
  history: diagram({ type: 'success', stack: 2, ghost: true }),
  decisions: diagram({ type: 'info', actions: 2 }),
  stream: diagram({ type: 'warning', stack: 3 }),
  task: diagram({ type: 'loading', actions: 1 }),
}
export const homePresets = ['save', 'retry', 'custom'] as const
export const previewTagline = 'Live · @samline/notify'

export default {
  label: 'Notify playground',
  title: 'Notifications with a next step',
  previewTagline,
  noscript:
    'Enable JavaScript to try the interaction. The explanation and all copied source files remain readable.',
  openCode: 'Explore the code',
  copyComplete: 'Copy the complete example',
  note: 'HTML / CDN opens directly in a browser. Package / ESM uses a bundler such as Vite: install @samline/notify, then serve these files. Separate files and Complete file implement the same interaction. The CSS styles the demo form; Notify supplies toast appearance and motion. Only Custom content supplies its own notification design.',
  modes: [
    { id: 'cdn', label: 'HTML / CDN' },
    { id: 'esm', label: 'Package / ESM' },
  ],
  reset: 'Reset this preview',
  dismiss: 'Dismiss notification',
  cancel: 'Cancel export',
} as const

export const fields = {
  position: 'Position',
  theme: 'Theme',
  direction: 'Reading direction',
  pageTheme: 'Follow the page',
  light: 'Light',
  dark: 'Dark',
  system: 'Follow the operating system',
  ltr: 'Left to right',
  rtl: 'Right to left',
  bottomRight: 'Bottom right',
  bottomLeft: 'Bottom left',
  topRight: 'Top right',
  topLeft: 'Top left',
  topCenter: 'Top center',
  bottomCenter: 'Bottom center',
  limit: 'Visible notifications',
  expanded: 'Keep the stack expanded',
  output: 'CSV preview',
  outcome: 'Sample service response',
  success: 'Success',
  failure: 'Server error',
  upload: 'Upload progress',
} as const

export const messages = {
  active: 'Active',
  history: 'History',
  notSent: 'October report · Delivery failed',
  sendFailed: 'The report could not be sent',
  retryHint: 'Your report is safe. Try sending it again.',
  retry: 'Retry sending',
  sent: 'October report sent',
  sentHint: 'Your team can now read the report.',
  saving: 'Saving your profile…',
  saved: 'Profile saved',
  uploading: 'Uploading…',
  uploaded: 'Upload complete',
  archived: 'Launch checklist archived',
  undoHint: 'You can restore it to your inbox.',
  undo: 'Undo archive',
  restored: 'Launch checklist restored',
  invitation: 'You are invited to Studio',
  invitationDetails: 'Studio workspace · Editor access · Accept the invitation from your account.',
  release: 'Release 4.0.0',
  releaseDetails: 'The release notes are ready for your review.',
  closeReceipt: 'Close release receipt',
  preference: 'Notification preference applied',
  activity: 'Activity recorded',
  dismissed: 'Notification dismissed. The details stay on this page.',
  review: 'Review access',
  reviewDetails:
    'Editor: upload assets and edit content. Billing and workspace administration stay with owners.',
  joinQuestion: 'Join Studio as an Editor?',
  join: 'Join workspace',
  joined: 'You joined Studio as an Editor',
  later: 'Not now',
  deferred: 'Invitation saved for later. You have not joined Studio.',
  normalEvent: 'Maya joined the workspace',
  successEvent: 'Campaign cover uploaded',
  infoEvent: 'Alex commented on the launch checklist',
  warningEvent: 'Workspace storage is almost full',
  errorEvent: 'The archive transfer failed',
  played: 'Activity events',
  expired: 'Auto-closed',
  manual: 'Dismissed manually',
  exporting: 'Generating October report…',
  exported: 'October report is ready',
  exportFailed: 'The report could not be generated',
  exportStopped: 'Export canceled',
  exportError: 'The sample report service is unavailable. Choose Success and try again.',
  viewCsv: 'View CSV',
  csvReady: 'CSV generated · 3 rows · Preview available below',
  noteLabel: 'Release note',
  notePlaceholder: 'What should your team know?',
  saveNote: 'Save release note',
  noteSaved: 'Release note saved locally',
  releaseStats: 'Runtime fixes · Compatible API · Native DOM',
} as const

/** Home-only "Toast types" panel: one call per kind of feedback. */
export const toastTypes = {
  label: 'Toast types',
  eyebrow: 'Every kind of feedback',
  heading: 'One call. The right tone.',
  description:
    'Pick a type to send a real notification. Change the position or the options, then hover the stack to expand it.',
  typesLabel: 'Notification types',
  position: 'Position',
  codeLabel: 'Code for the last notification',
  noscript: 'Enable JavaScript to send notifications from this panel.',
  note: 'Each button calls the same toast API you install. Options update the mounted toaster in place; hover or focus pauses timers and swipe dismisses.',
  positions: [
    ['bottom-right', 'Bottom right'],
    ['bottom-center', 'Bottom center'],
    ['bottom-left', 'Bottom left'],
    ['top-right', 'Top right'],
    ['top-center', 'Top center'],
    ['top-left', 'Top left'],
  ],
  toggles: [
    ['richColors', 'Rich colors'],
    ['closeButton', 'Close button'],
    ['expand', 'Expand the stack'],
  ],
  kinds: [
    {
      id: 'normal',
      label: 'Default',
      code: "toast('Event created', {\n  description: 'Friday, November 7 at 10:00',\n})",
    },
    { id: 'success', label: 'Success', code: "toast.success('Changes saved')" },
    {
      id: 'info',
      label: 'Info',
      code: "toast.info('A new version is available', {\n  description: 'Reload to update.',\n})",
    },
    { id: 'warning', label: 'Warning', code: "toast.warning('Storage is almost full')" },
    {
      id: 'error',
      label: 'Error',
      code: "toast.error('Payment failed', {\n  description: 'Check your card details and try again.',\n})",
    },
    {
      id: 'action',
      label: 'Action',
      code: "toast('Message archived', {\n  action: { label: 'Undo', onClick: restore },\n})",
    },
    {
      id: 'loading',
      label: 'Loading',
      code: "const id = toast.loading('Syncing your files…')\n// later:\ntoast.success('All files synced', { id })",
    },
    {
      id: 'promise',
      label: 'Promise',
      code: "toast.promise(uploadReport(), {\n  loading: 'Uploading report…',\n  success: 'Report uploaded',\n  error: 'Upload failed',\n})",
    },
  ],
  messages: {
    normal: 'Event created',
    normalDescription: 'Friday, November 7 at 10:00',
    success: 'Changes saved',
    info: 'A new version is available',
    infoDescription: 'Reload to update.',
    warning: 'Storage is almost full',
    error: 'Payment failed',
    errorDescription: 'Check your card details and try again.',
    action: 'Message archived',
    undo: 'Undo',
    restored: 'Message restored',
    loading: 'Syncing your files…',
    loaded: 'All files synced',
    promiseLoading: 'Uploading report…',
    promiseSuccess: 'Report uploaded',
    promiseError: 'Upload failed',
  },
} as const
