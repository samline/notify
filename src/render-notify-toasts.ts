import { notifyCore } from "./core/notify-core";
import type { NotifyItem, NotifyPosition } from "./core/notify-core";

const ICONS: Record<string, string> = {
	success:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
	error:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
	warning:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
	info:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>',
	loading:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" data-notify-icon="spin" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
	action:
		'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
};

const EXIT_MS = 600;

function capitalize(s: string): string {
	return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

let viewport: HTMLDivElement | null = null;
const toastEls = new Map<string, HTMLButtonElement>();

function getOrCreateViewport(position: NotifyPosition): HTMLDivElement {
	if (!viewport) {
		viewport = document.createElement("div");
		viewport.setAttribute("data-notify-viewport", "");
		viewport.setAttribute("data-position", position);
		viewport.setAttribute("data-theme", "light");
		document.body.appendChild(viewport);
	}
	return viewport;
}

function buildToastEl(toast: NotifyItem): HTMLButtonElement {
	const state = toast.type || "success";

	const btn = document.createElement("button");
	btn.type = "button";
	btn.setAttribute("data-notify-toast", "");
	btn.setAttribute("data-state", state);
	btn.setAttribute("data-ready", "false");
	btn.setAttribute("data-exiting", "false");

	const card = document.createElement("div");
	card.setAttribute("data-notify-card", "");

	const header = document.createElement("div");
	header.setAttribute("data-notify-header", "");

	const badge = document.createElement("div");
	badge.setAttribute("data-notify-badge", "");
	badge.setAttribute("data-state", state);
	badge.innerHTML = ICONS[state] || ICONS.success;

	const titleEl = document.createElement("span");
	titleEl.setAttribute("data-notify-title", "");
	titleEl.setAttribute("data-state", state);
	titleEl.textContent = toast.title || capitalize(state);

	header.appendChild(badge);
	header.appendChild(titleEl);
	card.appendChild(header);

	if (toast.description || toast.button) {
		const content = document.createElement("div");
		content.setAttribute("data-notify-content", "");
		content.setAttribute("data-visible", "true");

		if (toast.description) {
			const desc = document.createElement("div");
			desc.setAttribute("data-notify-description", "");
			desc.textContent = toast.description;
			content.appendChild(desc);
		}

		if (toast.button) {
			const actionBtn = document.createElement("button");
			actionBtn.setAttribute("data-notify-button", "");
			actionBtn.setAttribute("data-state", state);
			actionBtn.textContent = toast.button.title;
			actionBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				toast.button?.onClick();
				notifyCore.dismiss(toast.id);
			});
			content.appendChild(actionBtn);
		}

		card.appendChild(content);
	}

	btn.appendChild(card);
	btn.addEventListener("click", () => notifyCore.dismiss(toast.id));

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			btn.setAttribute("data-ready", "true");
		});
	});

	return btn;
}

function updateToastEl(el: HTMLButtonElement, toast: NotifyItem): void {
	const state = toast.type || "success";
	el.setAttribute("data-state", state);
	if (toast.exiting) {
		el.setAttribute("data-exiting", "true");
	}
}

export function renderNotifyToasts(options: { position?: NotifyPosition } = {}) {
	const position = options.position ?? "top-right";
	const vp = getOrCreateViewport(position);

	return notifyCore.subscribe((toasts) => {
		const liveIds = new Set(toasts.map((t) => t.id));

		for (const [id, el] of toastEls) {
			if (!liveIds.has(id)) {
				el.setAttribute("data-exiting", "true");
				setTimeout(() => {
					el.remove();
					toastEls.delete(id);
				}, EXIT_MS);
			}
		}

		for (const toast of toasts) {
			if (toastEls.has(toast.id)) {
				updateToastEl(toastEls.get(toast.id) as HTMLButtonElement, toast);
			} else {
				const el = buildToastEl(toast);
				toastEls.set(toast.id, el);
				vp.appendChild(el);
			}
		}
	});
}