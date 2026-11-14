# Explore the code audit — 2026-11-14

Scope: eleven task scenarios in the shared Examples and Docs code viewer,
including ESM/CDN, separate files and complete documents. The request was
clarified to concern copied code. Live presentation and runtime CSS are unchanged.

## Findings and changes

- The previous filter selected whole families of fields by preset. An upload
  containing only a progress bar copied input/select rules; other copies retained
  receipt selectors in shared rule lists. Selectors now follow the classes and
  native controls actually present in each example's markup.
- Native copied buttons retained `:not(.btn)` guards for the site's Button
  component. Copies now use native selectors and exclude site-only Button rules.
- Decorative form transitions and their reduced-motion cancellation are omitted
  from copies. The imported package stylesheet owns notification motion,
  stacking, swipe and reduced motion.
- Site theme variables always used fallback values in standalone documents.
  Copies now show those concrete values directly. Live previews retain tokens.
- Form borders, hover feedback, disabled states, focus outlines and responsive
  layout remain useful control styling. They do not duplicate Notify's toast
  rules. Receipt styles remain because `toast.custom()` is unstyled.
- Reviewed scenario JavaScript, imports and cleanup. Promise, same-id updates,
  action/cancel, cancellation, history and reset code serve the demonstrated
  tasks; no runtime implementation is embedded in the copies.
- Added CSS ownership explanations and browser assertions against leaked site
  selectors/tokens, decorative transitions, absent control types and receipt
  styles in unrelated scenarios.

## Size comparison

Formatted CSS, one loading mode per scenario; ESM/CDN share the CSS. Counts
include the new explanatory comment.

| Scenario | Previous lines | Current lines |
| --- | ---: | ---: |
| save | 147 | 133 |
| retry | 106 | 98 |
| upload | 147 | 110 |
| undo | 118 | 110 |
| persistent | 106 | 98 |
| custom | 185 | 180 |
| position | 181 | 164 |
| history | 106 | 98 |
| decisions | 106 | 98 |
| stream | 210 | 199 |
| task | 183 | 166 |

Total CSS characters: 43,400 → 30,843 (29% less). This measures source-code size,
not performance. Static HTML inspection confirmed all 66 generated
CSS/JavaScript/complete-file blocks match between Examples and Docs.

## Validation

Both Astro checks, canonical documentation, compiled integrations and 23 typed
recipe/README continuations passed. The 19 tooling tests, alternate root/nested
base builds, combined build, 2,179 links, migration and identity checks passed.
All 79 Chromium tests passed, including 44 separate/complete copied executions
across ESM/CDN, repeated live scenarios, open-state accessibility, responsive
controls, exact copying and all three routes. Formatting and check:release
also passed. The browser suite required permission to open its local preview
server after the sandbox rejected the port binding. No publication was performed.
