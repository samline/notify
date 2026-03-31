import { showSileoToast, useSileoToasts } from '../src/vue-sileo';

describe('Vue Sileo integration', () => {
  it('agrega un toast al composable', () => {
    showSileoToast({ title: 'Vue Toast', type: 'warning' });
    const { toasts } = useSileoToasts();
    expect(toasts.value.some(t => t.title === 'Vue Toast')).toBe(true);
  });
});
