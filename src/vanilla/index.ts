import { notify as coreNotify, sileo as coreSileo } from '../core/index';
import { initToasters, POSITIONS } from './toasterManager';

export { initToasters, POSITIONS };

// convenience: keep the previous shape where `notify` was the quick-show function
export const notify = coreNotify.show.bind(coreNotify);

type VanillaAPI = {
	sileo: typeof coreSileo;
	initToasters: typeof initToasters;
	notify: typeof notify;
	// keep full controller available under `controller` for advanced use
	controller?: typeof coreNotify;
	notifications?: any;
};

const defaultExport: VanillaAPI = { sileo: coreSileo, initToasters, notify, controller: coreNotify };
// backward compatibility: expose `notifications` key pointing to the same API object
(defaultExport as any).notifications = defaultExport;

export default defaultExport;
