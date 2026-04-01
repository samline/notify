import { notifyCore } from "./core/notify-core";

const notifyApi = {
	show: (options) => notifyCore.show(options),
	dismiss: (id) => notifyCore.dismiss(id),
	clear: () => {
		for (const toast of notifyCore.getToasts()) {
			notifyCore.dismiss(toast.id);
		}
	},
	subscribe: (listener) => notifyCore.subscribe(listener),
};

window.notify = notifyApi;
