export { notify, sileo } from '../core/index';
export { Toaster } from './Toaster';

import { notify as coreNotify, sileo as coreSileo } from '../core/index';

type ReactAPI = {
	notify: typeof coreNotify;
	sileo: typeof coreSileo;
	Toaster?: any;
};

const defaultExport: ReactAPI = { notify: coreNotify, sileo: coreSileo };
export default defaultExport;
