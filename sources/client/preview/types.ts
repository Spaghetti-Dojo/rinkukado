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

export type ServerState = {
	endpoint: string;
	nonce: string;
	rootSelector: string;
	denyClass: string;
	timings: Timings;
	sheetQuery: string;
	closeLabel: string;
	ctaLabel: string;
};
