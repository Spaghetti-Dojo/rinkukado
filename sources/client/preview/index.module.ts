import { getElement, store } from '@wordpress/interactivity';

import { bind, returnFocusOnShiftTab } from './events';
import { createDriver } from './driver';
import { modeOf, placeDialog, resolveRoot, unplaceDialog } from './dom';
import { createFetcher, readPreview } from './network';

import type { EventContext, Refs } from './context';
import type { PolicyOptions } from './policy';
import type { Endpoint } from './network';
import type { Mode } from './dom';
import type { Machine } from './intent';
import type { Preview, ServerState, Timings } from './types';

import './style.scss';

export { readPreview, resolveRoot };

type State = ServerState & {
	isOpen: boolean;
	isSheet: boolean;
	hasThumbnail: boolean;
	title: string;
	excerpt: string;
	permalink: string;
	thumbnailSrc: string;
	thumbnailSrcset: string;
	thumbnailAlt: string;
};

const fetcher = createFetcher();

const refs: Refs = {
	bound: false,
	frame: null,
	dialog: null,
	closeButton: null,
	activeLink: null,
	openLink: null,
	pendingTap: null,
	returningFocus: false,
};

// Keeps the mode correct on every rotation and resize, not only at the moment
// the popover opens. A guard stops a second registration when `init` runs
// more than once.
let queriesBound = false;
let mode: Mode = 'off';

function watchQueries(): void {
	if ( queriesBound ) {
		return;
	}

	queriesBound = true;

	const sheet = window.matchMedia( state.sheetQuery );
	const hover = window.matchMedia( state.hoverQuery );

	const apply = (): void => {
		mode = modeOf( sheet.matches, hover.matches );
		state.isSheet = mode === 'sheet';

		// A resize into the off mode leaves no popover behind.
		if ( mode === 'off' && state.isOpen ) {
			driver.send( { type: 'escape' } );
		}
	};

	apply();

	sheet.addEventListener( 'change', apply );
	hover.addEventListener( 'change', apply );
}

const { state }: { state: State } = store( 'rinkukado', {
	state: {} as State,

	actions: {
		close(): void {
			driver.send( { type: 'escape' } );
		},

		onDialogKeydown( event: KeyboardEvent ): void {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				driver.send( { type: 'escape' } );

				return;
			}

			returnFocusOnShiftTab( context, event );
		},
	},

	callbacks: {
		init(): void {
			const region = getElement().ref as HTMLElement | null;

			if ( region === null ) {
				return;
			}

			refs.dialog =
				region.querySelector< HTMLElement >( '.rinkukado__dialog' );
			refs.closeButton =
				region.querySelector< HTMLButtonElement >(
					'.rinkukado__close'
				);

			const root = resolveRoot( document, state.rootSelector );

			if ( root === null || refs.dialog === null ) {
				return;
			}

			watchQueries();
			bind( root, context );
		},
	},
} );

// Every part of the options holds for the whole page, so the parse of the
// endpoint runs once instead of once per pointer or focus event.
let options: PolicyOptions | null = null;

function policyOptions(): PolicyOptions {
	options ??= {
		siteOrigin: window.location.origin,
		homePath: new URL( state.endpoint ).pathname.replace(
			/wp-json.*$/,
			''
		),
		currentPath: window.location.pathname,
		denyClass: state.denyClass,
		containerSelector: state.containerSelector,
	};

	return options;
}

function endpointOf(): Endpoint {
	return { url: state.endpoint, nonce: state.nonce };
}

function applyPreview( preview: Preview ): void {
	state.title = preview.title;
	state.excerpt = preview.excerpt;
	state.permalink = preview.permalink;
	state.hasThumbnail = preview.thumbnail !== null;
	state.thumbnailSrc = preview.thumbnail?.src ?? '';
	state.thumbnailSrcset = preview.thumbnail?.srcset ?? '';
	state.thumbnailAlt = preview.thumbnail?.alt ?? '';
}

function revealDialog(): void {
	state.isOpen = true;
	refs.openLink = refs.activeLink;

	if ( refs.openLink !== null ) {
		refs.openLink.setAttribute( 'aria-describedby', 'rinkukado-title' );

		if ( refs.dialog !== null ) {
			placeDialog( refs.openLink, refs.dialog );
		}
	}

	if ( state.isSheet ) {
		refs.dialog?.focus();
	}
}

// A tap of this href had its navigation prevented while the result was
// unknown. Once the fetch fails, the link must still keep its normal
// behavior, so a pending tap navigates here instead.
function settleFailure( href: string ): void {
	const wasPendingTap = refs.pendingTap === href;

	refs.pendingTap = null;
	driver.send( { type: 'unavailable', href } );

	if ( wasPendingTap ) {
		window.location.assign( href );
	}
}

async function open( href: string ): Promise< void > {
	const result = await fetcher.load( href, endpointOf() );

	if ( result === 'aborted' ) {
		refs.pendingTap = null;
		driver.send( { type: 'unavailable', href } );

		return;
	}

	if ( result === 'unavailable' ) {
		settleFailure( href );

		return;
	}

	// The visitor moved on while the payload arrived.
	if ( driver.machine().href !== href ) {
		return;
	}

	refs.pendingTap = null;
	applyPreview( result );
	revealDialog();
}

// The focus event of this call is synchronous, so the flag covers the
// listener that reads it and nothing else.
function returnFocus( link: HTMLAnchorElement ): void {
	refs.returningFocus = true;

	try {
		link.focus();
	} finally {
		refs.returningFocus = false;
	}
}

function close( href: string | null ): void {
	fetcher.abort( href );

	state.isOpen = false;

	// The close belongs to the link that the dialog holds, never to the link
	// under the pointer. The two differ when the pointer moves from one link
	// to the next while the popover is open.
	if ( refs.openLink !== null ) {
		unplaceDialog( refs.openLink );

		if (
			refs.dialog !== null &&
			refs.dialog.contains( refs.dialog.ownerDocument.activeElement )
		) {
			returnFocus( refs.openLink );
		}
	}

	refs.openLink = null;
}

const driver = createDriver( {
	timings: (): Timings => state.timings,
	prefetch: ( href: string ): void => {
		void fetcher.load( href, endpointOf() );
	},
	open: ( href: string ): void => {
		void open( href );
	},
	close: ( href: string | null ): void => {
		close( href );
	},
	abort: ( href: string | null ): void => {
		fetcher.abort( href );
	},
	navigate: ( href: string ): void => {
		window.location.assign( href );
	},
} );

const context: EventContext = {
	refs,
	send: ( event ): void => {
		driver.send( event );
	},
	machine: (): Machine => driver.machine(),
	isOpen: (): boolean => state.isOpen,
	mode: (): Mode => mode,
	policyOptions,
	availability: ( href: string ) => fetcher.availability( href ),
};
