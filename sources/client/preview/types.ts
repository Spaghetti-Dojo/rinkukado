/**
 * The shared types of the preview: the preview payload, the timings, and
 * the configuration and the state that the server gives to the store.
 */

export type Thumbnail = {
	src: string;
	srcset: string;
	width: number;
	height: number;
	alt: string;
};

export type Preview = {
	id: number;
	title: string;
	excerpt: string;
	permalink: string;
	thumbnail: Thumbnail | null;
};

export type Timings = {
	prefetch: number;
	open: number;
	close: number;
};

export type ServerConfig = {
	endpoint: string;
	nonce: string;
	rootSelector: string;
	containerSelector: string;
	denyClass: string;
	timings: Timings;
	sheetQuery: string;
	hoverQuery: string;
};

export type ServerState = {
	closeLabel: string;
	ctaLabel: string;
};
