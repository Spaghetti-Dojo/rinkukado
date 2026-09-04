import { factsFromLink, isPreviewable } from './policy';
import { computePosition } from './position';

import type { PolicyOptions } from './policy';

const ANCHOR_NAME = '--rinkukado-anchor';

/**
 * Finds the element that holds the links. A selector that matches nothing
 * turns the whole feature off.
 * @param root     - The document that holds the root.
 * @param selector - The CSS selector of the root.
 */
export function resolveRoot(
	root: Document,
	selector: string
): Element | null {
	try {
		return root.querySelector( selector );
	} catch {
		return null;
	}
}

/**
 * Tells whether the pointer of the visitor is coarse, such as a touch screen.
 */
export function isCoarse(): boolean {
	return window.matchMedia( '(pointer: coarse)' ).matches;
}

/**
 * Finds the closest link of the target, when the policy allows it.
 * @param target  - The target of the DOM event.
 * @param options - The policy options of the current page.
 */
export function previewableLink(
	target: EventTarget | null,
	options: PolicyOptions
): HTMLAnchorElement | null {
	if ( ! ( target instanceof Element ) ) {
		return null;
	}

	const link = target.closest< HTMLAnchorElement >( 'a[href]' );

	if ( link === null ) {
		return null;
	}

	return isPreviewable( factsFromLink( link ), options ) ? link : null;
}

/**
 * Tells whether the related target of a pointer or a focus event stays
 * inside the dialog.
 * @param dialog  - The dialog element, or nothing when it is not ready.
 * @param related - The related target of the event.
 */
export function staysInDialog(
	dialog: HTMLElement | null,
	related: EventTarget | null
): boolean {
	return related instanceof Node && ( dialog?.contains( related ) ?? false );
}

function placeWithAnchor( link: HTMLAnchorElement ): void {
	link.style.setProperty( 'anchor-name', ANCHOR_NAME );
}

function placeWithRect( link: HTMLAnchorElement, dialog: HTMLElement ): void {
	const rect = link.getBoundingClientRect();

	const placement = computePosition(
		{
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height,
		},
		{ width: dialog.offsetWidth, height: dialog.offsetHeight },
		{ width: window.innerWidth, height: window.innerHeight }
	);

	dialog.style.top = `${ placement.top }px`;
	dialog.style.left = `${ placement.left }px`;
	dialog.dataset[ 'side' ] = placement.side;
}

/**
 * Places the dialog near the link. Browsers that support CSS anchor
 * positioning only need the anchor name; the others get an inline position.
 * @param link   - The link that the dialog previews.
 * @param dialog - The dialog element.
 */
export function placeDialog(
	link: HTMLAnchorElement,
	dialog: HTMLElement
): void {
	if ( window.CSS.supports( 'anchor-name: --a' ) ) {
		placeWithAnchor( link );

		return;
	}

	placeWithRect( link, dialog );
}

/**
 * Removes the anchor name and the description of the link.
 * @param link - The link that the dialog described.
 */
export function unplaceDialog( link: HTMLAnchorElement ): void {
	link.removeAttribute( 'aria-describedby' );
	link.style.removeProperty( 'anchor-name' );
}
