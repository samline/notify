import Toaster from './Toaster.svelte';
export { Toaster };
export { initSileoStore, toasts } from './store';
export { sileo } from '../core/index';
import { sileo } from '../core/index';

// Expose notify for API consistency
export const notify = sileo;

export default { Toaster, notify: sileo, sileo };
