import { showSileoToast, useSileoToasts } from '../src/vue-sileo';

describe('Vue Sileo integration', () => {
  it('should add a toast to the composable', () => {
    showSileoToast({ title: 'Vue Toast', type: 'warning' });
    const { toasts } = useSileoToasts();
    expect(toasts.value.some(t => t.title === 'Vue Toast')).toBe(true);
  });
});
