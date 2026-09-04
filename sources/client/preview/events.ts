/* eslint-disable max-lines */
import { isCoarse, placeDialog, previewableLink, staysInDialog } from './dom';

import type { PolicyOptions } from './policy';
import type { IntentEvent, Machine } from './intent';

/**
 * The mutable references that the delegated listeners read and write.
 */
export type Refs = {
	machine: Machine;
	frame: number | null;
	dialog: HTMLElement | null;
	closeButton: HTMLButtonElement | null;
	activeLink: HTMLAnchorElement | null;
};

/**
 * What the event handlers need from the store, without importing it.
 */
export type EventContext = {
	refs: Refs;
	send: ( event: IntentEvent ) => void;
	isOpen: () => boolean;
	isSheet: () => boolean;
	policyOptions: () => PolicyOptions;
};

function linkOf(
	context: EventContext,
	target: EventTarget | null
): HTMLAnchorElement | null {
	return previewableLink( target, context.policyOptions() );
}

function returnFocusOnShiftTab(
	context: EventContext,
	event: KeyboardEvent
): void {
	const { refs } = context;

	// Shift and Tab on the close button returns to the link.
	if (
		event.key === 'Tab' &&
		event.shiftKey &&
		event.target === refs.closeButton &&
		refs.activeLink !== null
	) {
		event.preventDefault();
		refs.activeLink.focus();
	}
}

/**
 * Handles the keydown of the dialog: escape closes it, and a reverse tab
 * off the close button returns the focus to the link.
 * @param context - The event context.
 * @param event   - The keyboard event of the dialog.
 */
export function onDialogKeydown(
	context: EventContext,
	event: KeyboardEvent
): void {
	if ( event.key === 'Escape' ) {
		event.preventDefault();
		context.send( { type: 'escape' } );

		return;
	}

	returnFocusOnShiftTab( context, event );
}

function onPointerOver( context: EventContext, event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	const link = linkOf( context, event.target );

	if ( link === null ) {
		return;
	}

	context.refs.activeLink = link;
	context.send( { type: 'enter', href: link.href, at: Date.now() } );
}

function leaveUnlessInDialog(
	context: EventContext,
	event: Event,
	related: EventTarget | null
): void {
	if ( staysInDialog( context.refs.dialog, related ) ) {
		return;
	}

	if ( linkOf( context, event.target ) === null ) {
		return;
	}

	context.send( { type: 'leave', at: Date.now() } );
}

function onPointerOut( context: EventContext, event: Event ): void {
	if ( isCoarse() ) {
		return;
	}

	leaveUnlessInDialog(
		context,
		event,
		( event as PointerEvent ).relatedTarget
	);
}

function onDialogPointerOut( context: EventContext, event: Event ): void {
	if (
		staysInDialog(
			context.refs.dialog,
			( event as PointerEvent ).relatedTarget
		)
	) {
		return;
	}

	context.send( { type: 'leave', at: Date.now() } );
}

function cancelClose( context: EventContext ): void {
	const { machine } = context.refs;

	if ( machine.phase === 'open' && machine.href !== null ) {
		context.send( { type: 'enter', href: machine.href, at: Date.now() } );
	}
}

function onFocusIn( context: EventContext, event: Event ): void {
	const link = linkOf( context, event.target );

	if ( link === null ) {
		return;
	}

	context.refs.activeLink = link;
	context.send( { type: 'focus', href: link.href, at: Date.now() } );
}

function onFocusOut( context: EventContext, event: Event ): void {
	leaveUnlessInDialog(
		context,
		event,
		( event as FocusEvent ).relatedTarget
	);
}

function onClick( context: EventContext, event: Event ): void {
	if ( ! isCoarse() ) {
		return;
	}

	const link = linkOf( context, event.target );

	if ( link === null ) {
		return;
	}

	const { machine } = context.refs;

	// The first tap opens the sheet. The second tap of the same link navigates.
	if ( ! ( machine.phase === 'open' && machine.href === link.href ) ) {
		event.preventDefault();
	}

	context.refs.activeLink = link;
	context.send( { type: 'tap', href: link.href } );
}

function tabEntersDialog(
	context: EventContext,
	keyboard: KeyboardEvent
): boolean {
	const { refs } = context;

	return (
		keyboard.key === 'Tab' &&
		! keyboard.shiftKey &&
		context.isOpen() &&
		keyboard.target === refs.activeLink &&
		refs.closeButton !== null
	);
}

function onKeyDown( context: EventContext, event: Event ): void {
	const keyboard = event as KeyboardEvent;

	if ( keyboard.key === 'Escape' ) {
		context.send( { type: 'escape' } );

		return;
	}

	// Tab from the link enters the dialog.
	if ( tabEntersDialog( context, keyboard ) ) {
		keyboard.preventDefault();
		context.refs.closeButton?.focus();
	}
}

function onDocumentClick( context: EventContext, event: Event ): void {
	if ( ! context.isOpen() ) {
		return;
	}

	if ( staysInDialog( context.refs.dialog, event.target ) ) {
		return;
	}

	if ( linkOf( context, event.target ) !== null ) {
		return;
	}

	context.send( { type: 'outside' } );
}

function linkLeftViewport( rect: DOMRect ): boolean {
	return rect.bottom < 0 || rect.top > window.innerHeight;
}

function handleViewportFrame( context: EventContext ): void {
	const { refs } = context;

	refs.frame = null;

	if ( refs.activeLink === null || context.isSheet() ) {
		return;
	}

	if ( linkLeftViewport( refs.activeLink.getBoundingClientRect() ) ) {
		context.send( { type: 'escape' } );

		return;
	}

	if ( refs.dialog !== null ) {
		placeDialog( refs.activeLink, refs.dialog );
	}
}

function onViewportChange( context: EventContext ): void {
	if ( ! context.isOpen() || context.refs.frame !== null ) {
		return;
	}

	context.refs.frame = window.requestAnimationFrame( () => {
		handleViewportFrame( context );
	} );
}

function attachElementListeners(
	element: Element,
	context: EventContext
): void {
	element.addEventListener( 'pointerover', ( event ) => {
		onPointerOver( context, event );
	} );
	element.addEventListener( 'pointerout', ( event ) => {
		onPointerOut( context, event );
	} );
	element.addEventListener( 'focusin', ( event ) => {
		onFocusIn( context, event );
	} );
	element.addEventListener( 'focusout', ( event ) => {
		onFocusOut( context, event );
	} );
	element.addEventListener( 'click', ( event ) => {
		onClick( context, event );
	} );
	element.addEventListener( 'keydown', ( event ) => {
		onKeyDown( context, event );
	} );
}

function attachDialogListeners( refs: Refs, context: EventContext ): void {
	refs.dialog?.addEventListener( 'pointerover', () => {
		cancelClose( context );
	} );
	refs.dialog?.addEventListener( 'pointerout', ( event ) => {
		onDialogPointerOut( context, event );
	} );
}

function attachGlobalListeners( context: EventContext ): void {
	document.addEventListener( 'click', ( event ) => {
		onDocumentClick( context, event );
	} );
	window.addEventListener(
		'scroll',
		() => {
			onViewportChange( context );
		},
		{
			passive: true,
		}
	);
	window.addEventListener( 'resize', () => {
		onViewportChange( context );
	} );
}

/**
 * Attaches every delegated listener of the region to the root and the
 * dialog, and the two listeners of the document and the window.
 * @param element - The root that holds the links.
 * @param context - The event context.
 */
export function bind( element: Element, context: EventContext ): void {
	const { refs } = context;

	attachElementListeners( element, context );
	attachDialogListeners( refs, context );
	attachGlobalListeners( context );
}
