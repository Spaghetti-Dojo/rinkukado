/**
 * The delegated listeners that turn page events into intent machine events.
 */

import { placeDialog, staysInDialog, staysInLink } from './dom';
import { linkOf } from './context';

import type { EventContext } from './context';

/**
 * Moves the focus back to the link when the visitor presses Shift and Tab
 * on the close button of the dialog.
 * @param context - The event context.
 * @param event   - The keyboard event of the dialog.
 */
export function returnFocusOnShiftTab(
	context: EventContext,
	event: KeyboardEvent
): void {
	const { refs } = context;

	if (
		event.key === 'Tab' &&
		event.shiftKey &&
		event.target === refs.closeButton &&
		refs.openLink !== null
	) {
		event.preventDefault();
		refs.openLink.focus();
	}
}

function onPointerOver( context: EventContext, event: Event ): void {
	if ( context.mode() !== 'hover' ) {
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

	const link = linkOf( context, event.target );

	if ( link === null ) {
		return;
	}

	// The pointer crossed into a child of the same link. The visitor did
	// not leave the link, so the intent must stay alive.
	if ( staysInLink( link, related ) ) {
		return;
	}

	context.send( { type: 'leave', at: Date.now() } );
}

function onPointerOut( context: EventContext, event: Event ): void {
	if ( context.mode() !== 'hover' ) {
		return;
	}

	leaveUnlessInDialog(
		context,
		event,
		( event as PointerEvent ).relatedTarget
	);
}

function onDialogPointerOut( context: EventContext, event: Event ): void {
	const related = ( event as PointerEvent ).relatedTarget;

	if ( staysInDialog( context.refs.dialog, related ) ) {
		return;
	}

	context.send( { type: 'leave', at: Date.now() } );
}

function cancelClose( context: EventContext ): void {
	const machine = context.machine();

	if ( machine.phase === 'open' && machine.href !== null ) {
		context.send( { type: 'enter', href: machine.href, at: Date.now() } );
	}
}

function onFocusIn( context: EventContext, event: Event ): void {
	// The close returns the focus to the link. That focus ends the popover;
	// it is not a new intent, so it must open nothing.
	if ( context.refs.returningFocus || context.mode() === 'off' ) {
		return;
	}

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

// A href already known unavailable keeps its normal behavior. Otherwise
// the machine, not the browser, drives the navigation: `tap` answers with
// an `open` command or a `navigate` command, never both.
function onClick( context: EventContext, event: Event ): void {
	if ( context.mode() !== 'sheet' ) {
		return;
	}

	const link = linkOf( context, event.target );

	if (
		link === null ||
		context.availability( link.href ) === 'unavailable'
	) {
		return;
	}

	event.preventDefault();
	context.refs.activeLink = link;
	context.refs.pendingTap = link.href;
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
		keyboard.target === refs.openLink &&
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
	if (
		! context.isOpen() ||
		staysInDialog( context.refs.dialog, event.target ) ||
		linkOf( context, event.target ) !== null
	) {
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

	if ( refs.openLink === null || context.mode() !== 'hover' ) {
		return;
	}

	if ( linkLeftViewport( refs.openLink.getBoundingClientRect() ) ) {
		context.send( { type: 'escape' } );

		return;
	}

	if ( refs.dialog !== null ) {
		placeDialog( refs.openLink, refs.dialog );
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

type Handler = ( context: EventContext, event: Event ) => void;

const rootHandlers: Record< string, Handler > = {
	pointerover: onPointerOver,
	pointerout: onPointerOut,
	focusin: onFocusIn,
	focusout: onFocusOut,
	click: onClick,
};

const dialogHandlers: Record< string, Handler > = {
	pointerover: cancelClose,
	pointerout: onDialogPointerOut,
};

function attach(
	target: EventTarget,
	handlers: Record< string, Handler >,
	context: EventContext
): void {
	Object.entries( handlers ).forEach( ( [ name, handler ] ) => {
		target.addEventListener( name, ( event: Event ) => {
			handler( context, event );
		} );
	} );
}

function attachGlobalListeners( context: EventContext ): void {
	document.addEventListener( 'click', ( event ) => {
		onDocumentClick( context, event );
	} );
	// The listener sits on the document, not on the root of the region.
	// A hover opens the popover without a move of the focus, so the focus
	// can stay on `body`. A listener on the root would never see the key
	// event of such a visitor, and Escape would not close the popover.
	document.addEventListener( 'keydown', ( event ) => {
		onKeyDown( context, event );
	} );
	window.addEventListener(
		'scroll',
		() => {
			onViewportChange( context );
		},
		{ passive: true }
	);
	window.addEventListener( 'resize', () => {
		onViewportChange( context );
	} );
}

/**
 * Attaches every delegated listener of the region to the root and the
 * dialog, and the listeners of the document and the window. A second call
 * on the same context attaches nothing, because `refs.bound` guards it.
 * @param element - The root that holds the links.
 * @param context - The event context.
 */
export function bind( element: Element, context: EventContext ): void {
	const { refs } = context;

	if ( refs.bound ) {
		return;
	}

	refs.bound = true;

	attach( element, rootHandlers, context );

	if ( refs.dialog !== null ) {
		attach( refs.dialog, dialogHandlers, context );
	}

	attachGlobalListeners( context );
}
