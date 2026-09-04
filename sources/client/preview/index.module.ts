import { getElement, store } from '@wordpress/interactivity';

import { bind, returnFocusOnShiftTab } from './events';
import { createDriver } from './driver';
import { placeDialog, resolveRoot, unplaceDialog } from './dom';
import { createFetcher, readPreview } from './network';

import type { EventContext, Refs } from './context';
import type { PolicyOptions } from './policy';
import type { Endpoint } from './network';
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
};

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

			bind( root, context );
		},
	},
} );

function policyOptions(): PolicyOptions {
	return {
		siteOrigin: window.location.origin,
		homePath: new URL( state.endpoint ).pathname.replace(
			/wp-json.*$/,
			''
		),
		currentPath: window.location.pathname,
		denyClass: state.denyClass,
	};
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
	state.isSheet = window.matchMedia( state.sheetQuery ).matches;
	state.isOpen = true;

	if ( refs.activeLink !== null ) {
		refs.activeLink.setAttribute( 'aria-describedby', 'rinkukado-title' );

		if ( refs.dialog !== null ) {
			placeDialog( refs.activeLink, refs.dialog );
		}
	}

	if ( state.isSheet ) {
		refs.dialog?.focus();
	}
}

async function open( href: string ): Promise< void > {
	const result = await fetcher.load( href, endpointOf() );

	if ( result === 'unavailable' || result === 'aborted' ) {
		driver.reset();

		return;
	}

	// The visitor moved on while the payload arrived.
	if ( driver.machine().href !== href ) {
		return;
	}

	applyPreview( result );
	revealDialog();
}

function close( href: string | null ): void {
	fetcher.abort( href );

	state.isOpen = false;

	if ( refs.activeLink !== null ) {
		unplaceDialog( refs.activeLink );

		if (
			refs.dialog !== null &&
			refs.dialog.contains( refs.dialog.ownerDocument.activeElement )
		) {
			refs.activeLink.focus();
		}
	}

	refs.activeLink = null;
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
	isSheet: (): boolean => state.isSheet,
	policyOptions,
};
