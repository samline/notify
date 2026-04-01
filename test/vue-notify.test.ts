import { showNotifyToast, useNotifyToasts } from '../src/vue-notify';

describe('Vue Notify integration', () => {
  it('agrega un toast al composable', () => {
    showNotifyToast({ title: 'Vue Toast', type: 'warning' });
    const { toasts } = useNotifyToasts();
    expect(toasts.value.some(t => t.title === 'Vue Toast')).toBe(true);
  });
});
