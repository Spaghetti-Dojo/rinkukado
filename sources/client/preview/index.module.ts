/* eslint-disable max-lines */
import { getElement, store } from '@wordpress/interactivity';

import { initial, nextDeadline, reduce } from './intent';
import {
	isCoarse,
	placeDialog,
	previewableLink,
	resolveRoot,
	staysInDialog,
	unplaceDialog,
} from './dom';
import { createFetcher, readPreview } from './network';

import type { PolicyOptions } from './policy';
import type { Endpoint } from './network';
import type { Command, IntentEvent, Machine } from './intent';
import type { Preview, ServerState } from './types';

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

let machine: Machine = initial;
let timer: number | null = null;
let frame: number | null = null;
let dialog: HTMLElement | null = null;
let closeButton: HTMLButtonElement | null = null;
let activeLink: HTMLAnchorElement | null = null;

const { state }: { state: State } = store( 'rinkukado', {
	state: {} as State,

	actions: {
		close(): void {
			send( { type: 'escape' } );
		},

		onDialogKeydown( event: KeyboardEvent ): void {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				send( { type: 'escape' } );

				return;
			}

			returnFocusOnShiftTab( event );
		},
	},

	callbacks: {
		init(): void {
			const region = getElement().ref as HTMLElement | null;

			if ( region === null ) {
				return;
			}

			dialog =
				region.querySelector< HTMLElement >( '.rinkukado__dialog' );
			closeButton =
				region.querySelector< HTMLButtonElement >(
					'.rinkukado__close'
				);

			const root = resolveRoot( document, state.rootSelector );

			if ( root === null || dialog === null ) {
				return;
			}

			bind( root );
		},
	},
} );

function returnFocusOnShiftTab( event: KeyboardEvent ): void {
	// Shift and Tab on the close button returns to the link.
	if (
		event.key === 'Tab' &&
		event.shiftKey &&
		event.target === closeButton &&
		activeLink !== null
	) {
		event.preventDefault();
		activeLink.focus();
	}
}

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

function linkOf( target: EventTarget | null ): HTMLAnchorElement | null {
	return previewableLink( target, policyOptions() );
}

function bind( element: Element ): void {
	element.addEventListener( 'pointerover', onPointerOver );
	element.addEventListener( 'pointerout', onPointerOut );
	element.addEventListener( 'focusin', onFocusIn );
	element.addEventListener( 'focusout', onFocusOut );
	element.addEventListener( 'click', onClick );
	element.addEventListener( 'keydown', onKeyDown );

	dialog?.addEventListener( 'pointerover', cancelClose );
	dialog?.addEventListener( 'pointerout', onDialogPointerOut );

	document.addEventListener( 'click', onDocumentClick );
	window.addEventListener( 'scroll', onViewportChange, { passive: true } );
	window.addEventListener( 'resize', onViewportChange );
}

function onPointerOver( event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	const link = linkOf( event.target );

	if ( link === null ) {
		return;
	}

	activeLink = link;
	send( { type: 'enter', href: link.href, at: Date.now() } );
}

function onPointerOut( event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	leaveUnlessInDialog( event, ( event as PointerEvent ).relatedTarget );
}

function onDialogPointerOut( event: Event ): void {
	if ( staysInDialog( dialog, ( event as PointerEvent ).relatedTarget ) ) {
		return;
	}

	send( { type: 'leave', at: Date.now() } );
}

function cancelClose(): void {
	if ( machine.phase === 'open' && machine.href !== null ) {
		send( { type: 'enter', href: machine.href, at: Date.now() } );
	}
}

function onFocusIn( event: Event ): void {
	const link = linkOf( event.target );

	if ( link === null ) {
		return;
	}

	activeLink = link;
	send( { type: 'focus', href: link.href, at: Date.now() } );
}

function onFocusOut( event: Event ): void {
	leaveUnlessInDialog( event, ( event as FocusEvent ).relatedTarget );
}

function leaveUnlessInDialog(
	event: Event,
	related: EventTarget | null
): void {
	if ( staysInDialog( dialog, related ) ) {
		return;
	}

	if ( linkOf( event.target ) === null ) {
		return;
	}

	send( { type: 'leave', at: Date.now() } );
}

function onClick( event: Event ): void {
	if ( ! isCoarse() ) {
		return;
	}

	const link = linkOf( event.target );

	if ( link === null ) {
		return;
	}

	// The first tap opens the sheet. The second tap of the same link navigates.
	if ( ! ( machine.phase === 'open' && machine.href === link.href ) ) {
		event.preventDefault();
	}

	activeLink = link;
	send( { type: 'tap', href: link.href } );
}

function tabEntersDialog( keyboard: KeyboardEvent ): boolean {
	return (
		keyboard.key === 'Tab' &&
		! keyboard.shiftKey &&
		state.isOpen &&
		keyboard.target === activeLink &&
		closeButton !== null
	);
}

function onKeyDown( event: Event ): void {
	const keyboard = event as KeyboardEvent;

	if ( keyboard.key === 'Escape' ) {
		send( { type: 'escape' } );

		return;
	}

	// Tab from the link enters the dialog.
	if ( tabEntersDialog( keyboard ) ) {
		keyboard.preventDefault();
		closeButton?.focus();
	}
}

function onDocumentClick( event: Event ): void {
	if ( ! state.isOpen ) {
		return;
	}

	if ( staysInDialog( dialog, event.target ) ) {
		return;
	}

	if ( linkOf( event.target ) !== null ) {
		return;
	}

	send( { type: 'outside' } );
}

function onViewportChange(): void {
	if ( ! state.isOpen || frame !== null ) {
		return;
	}

	frame = window.requestAnimationFrame( handleViewportFrame );
}

function linkLeftViewport( link: HTMLAnchorElement ): boolean {
	const rect = link.getBoundingClientRect();

	return rect.bottom < 0 || rect.top > window.innerHeight;
}

function handleViewportFrame(): void {
	frame = null;

	if ( activeLink === null || state.isSheet ) {
		return;
	}

	if ( linkLeftViewport( activeLink ) ) {
		send( { type: 'escape' } );

		return;
	}

	if ( dialog !== null ) {
		placeDialog( activeLink, dialog );
	}
}

function send( event: IntentEvent ): void {
	const result = reduce( machine, event, state.timings );
	machine = result.machine;

	result.commands.forEach( run );

	schedule();
}

function schedule(): void {
	if ( timer !== null ) {
		window.clearTimeout( timer );
		timer = null;
	}

	const deadline = nextDeadline( machine );

	if ( deadline === null ) {
		return;
	}

	const delay = Math.max( 0, deadline - Date.now() );

	timer = window.setTimeout( () => {
		timer = null;
		send( { type: 'tick', at: Date.now() } );
	}, delay );
}

type Runners = {
	[ K in Command[ 'type' ] ]: (
		command: Extract< Command, { type: K } >
	) => void;
};

const runners: Runners = {
	prefetch: ( command ) => {
		void load( command.href );
	},
	open: ( command ) => {
		void open( command.href );
	},
	close: () => {
		close();
	},
	abort: () => {
		fetcher.abort();
	},
	navigate: ( command ) => {
		window.location.assign( command.href );
	},
};

function run( command: Command ): void {
	const runner = runners[ command.type ] as ( command: Command ) => void;

	runner( command );
}

function endpointOf(): Endpoint {
	return { url: state.endpoint, nonce: state.nonce };
}

async function load( href: string ): Promise< void > {
	await fetcher.load( href, endpointOf() );
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

	if ( activeLink !== null ) {
		activeLink.setAttribute( 'aria-describedby', 'rinkukado-title' );

		if ( dialog !== null ) {
			placeDialog( activeLink, dialog );
		}
	}

	if ( state.isSheet ) {
		dialog?.focus();
	}
}

async function open( href: string ): Promise< void > {
	const result = await fetcher.load( href, endpointOf() );

	if ( result === 'unavailable' || result === 'aborted' ) {
		machine = initial;

		return;
	}

	// The visitor moved on while the payload arrived.
	if ( machine.href !== href ) {
		return;
	}

	applyPreview( result );
	revealDialog();
}

function close(): void {
	fetcher.abort();

	state.isOpen = false;

	if ( activeLink !== null ) {
		unplaceDialog( activeLink );

		if (
			dialog !== null &&
			dialog.contains( dialog.ownerDocument.activeElement )
		) {
			activeLink.focus();
		}
	}

	activeLink = null;
}
