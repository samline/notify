import { showSileoToast, sileoToasts } from '../src/svelte-sileo';

describe('Svelte Sileo integration', () => {
  it('should add a toast to the store', () => {
    showSileoToast({ title: 'Svelte Toast', type: 'info' });
    let found = false;
    sileoToasts.subscribe(toasts => {
      found = toasts.some(t => t.title === 'Svelte Toast');
    })();
    expect(found).toBe(true);
  });
});
