// Notify logic (no React dependencies)
// Provides toast management and utilities for VanillaJS, Vue, Svelte, etc.

export type NotifyState =
	| "success"
	| "loading"
	| "error"
	| "warning"
	| "info"
	| "action";

export interface NotifyStyles {
	title?: string;
	description?: string;
	badge?: string;
	button?: string;
}

export interface NotifyButton {
	title: string;
	onClick: () => void;
}

export const NOTIFY_POSITIONS = [
	"top-left",
	"top-center",
	"top-right",
	"bottom-left",
	"bottom-center",
	"bottom-right",
] as const;

export type NotifyPosition = (typeof NOTIFY_POSITIONS)[number];

export interface NotifyOptions {
	title?: string;
	description?: string;
	type?: NotifyState;
	position?: NotifyPosition;
	duration?: number | null;
	icon?: any;
	styles?: NotifyStyles;
	fill?: string;
	roundness?: number;
	autopilot?: boolean | { expand?: number; collapse?: number };
	button?: NotifyButton;
}

export interface NotifyItem extends NotifyOptions {
	id: string;
	instanceId: string;
	exiting?: boolean;
	autoExpandDelayMs?: number;
	autoCollapseDelayMs?: number;
}

type NotifyListener = (toasts: NotifyItem[]) => void;

export class NotifyCore {
	private toasts: NotifyItem[] = [];
	private listeners: Set<NotifyListener> = new Set();
	private position: NotifyPosition = "top-right";
	private options: Partial<NotifyOptions> | undefined = undefined;
	private idCounter = 0;

	private generateId() {
		return `${++this.idCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	}

	subscribe(fn: NotifyListener) {
		this.listeners.add(fn);
		fn(this.toasts);
		return () => this.listeners.delete(fn);
	}

	private emit() {
		for (const fn of this.listeners) fn(this.toasts);
	}

	private update(fn: (prev: NotifyItem[]) => NotifyItem[]) {
		this.toasts = fn(this.toasts);
		this.emit();
	}

	dismiss(id: string) {
		const item = this.toasts.find((t) => t.id === id);
		if (!item || item.exiting) return;
		this.update((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
		setTimeout(() => this.update((prev) => prev.filter((t) => t.id !== id)), 600);
	}

	show(opts: NotifyOptions) {
		// Use a unique identifier based on options (e.g., the title or a generated key)
		// If not provided, use a default one
		const id = opts.title ? `notify-${opts.title}` : "notify-default";
		const prevItem = this.toasts.find((t) => t.id === id);
		const instanceId = prevItem?.instanceId ?? this.generateId();
		// Set the state correctly
		const state = opts.type ?? prevItem?.type ?? "success";
		const item: NotifyItem = {
			...prevItem,
			...opts,
			id,
			instanceId,
			type: state,
		} as NotifyItem;
		this.update((prev) => {
			const filtered = prev.filter((t) => t.id !== id);
			return [...filtered, item];
		});
		return id;
	}

	getToasts() {
		return this.toasts;
	}
}

// Global instance for multiplatform usage
export const notifyCore = new NotifyCore();
