import t, { presets, fields, messages, type DemoPreset } from '../i18n/translations/en/demo'
const field = (label: string, input: string) =>
  `<label class="notify-demo-field">${label}${input}</label>`
const select = (hook: string, entries: readonly (readonly [string, string])[]) =>
  `<span class="notify-demo-select"><select ${hook}>${entries.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></span>`
// The release card Notify renders through toast.custom(); the demo clones it.
const receipt = `<template>
<div class="notify-receipt">
<strong>${messages.release}</strong>
<p>${messages.releaseDetails}</p>
<small>${messages.releaseStats}</small>
<label>${messages.noteLabel}<textarea placeholder="${messages.notePlaceholder}" maxlength="160" rows="2"></textarea></label>
<div class="notify-receipt-actions">
<button type="button" data-save-note>${messages.saveNote}</button>
<button type="button" data-close-receipt>${messages.closeReceipt}</button>
</div>
</div>
</template>`
export const bodyFor = (preset: DemoPreset) => {
  const copy = presets[preset]
  return `<p class="notify-demo-eyebrow">${copy.eyebrow}</p>
<strong class="notify-demo-heading">${copy.heading}</strong>
<p class="notify-demo-description">${copy.description}</p>
${preset === 'save' ? field(presets.save.field, `<input type="text" value="${presets.save.value}" required maxlength="60" autocomplete="name">`) : ''}
${preset === 'undo' ? '<div class="notify-demo-item" data-demo-item><span aria-hidden="true">↗</span><span><strong>Launch checklist</strong><br>Design review · Today, 10:30</span></div>' : ''}
${preset === 'upload' ? field(fields.upload, '<progress max="100" value="0"></progress>') : ''}
${
  preset === 'position'
    ? `<div class="notify-demo-fields">${field(
        fields.position,
        select('data-position', [
          ['bottom-right', fields.bottomRight],
          ['bottom-left', fields.bottomLeft],
          ['top-right', fields.topRight],
          ['top-left', fields.topLeft],
          ['top-center', fields.topCenter],
          ['bottom-center', fields.bottomCenter],
        ])
      )}${field(
        fields.theme,
        select('data-theme', [
          ['page', fields.pageTheme],
          ['light', fields.light],
          ['dark', fields.dark],
          ['system', fields.system],
        ])
      )}${field(
        fields.direction,
        select('data-direction', [
          ['ltr', fields.ltr],
          ['rtl', fields.rtl],
        ])
      )}</div>`
    : ''
}
${preset === 'custom' ? receipt : ''}
${preset === 'decisions' ? '<p data-review-details hidden></p>' : ''}
${
  preset === 'stream'
    ? `<div class="notify-demo-fields">${field(
        fields.limit,
        select('data-visible-limit', [
          ['3', '3'],
          ['1', '1'],
          ['5', '5'],
        ])
      )}<label class="notify-demo-check"><input type="checkbox" data-stack-expanded>${fields.expanded}</label></div><ol class="notify-demo-feed" data-event-log aria-label="Studio activity"></ol>`
    : ''
}
${
  preset === 'task'
    ? `${field(
        fields.outcome,
        select('data-task-outcome', [
          ['success', fields.success],
          ['error', fields.failure],
        ])
      )}<pre class="notify-demo-output" data-export-output aria-label="${fields.output}" tabindex="0" hidden></pre>`
    : ''
}
<p class="notify-demo-result" data-demo-result role="status">${copy.initial}</p>`
}
export const htmlFor = (
  preset: DemoPreset
) => `<section class="notify-demo" data-notify-demo data-preset="${preset}" aria-label="${presets[preset].eyebrow}">
${bodyFor(preset)}
<div class="notify-demo-actions">
<button type="button" data-demo-action>${presets[preset].action}</button>
${['persistent', 'history'].includes(preset) ? `<button type="button" data-demo-dismiss>${t.dismiss}</button>` : ''}
${preset === 'task' ? `<button type="button" data-demo-cancel disabled>${t.cancel}</button>` : ''}
<button type="button" data-demo-reset>${t.reset}</button>
</div>
</section>`
