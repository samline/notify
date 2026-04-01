import type { ReactNode } from "react";

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
