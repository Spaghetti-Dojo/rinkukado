/**
 * The DOM helpers of the preview. They find the root and the previewable
 * link, read the mode from the media queries, and place the dialog next to
 * its link.
 */

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
 * The three modes of the feature.
 *
 * `sheet` opens a sheet on a tap, and every coarse pointer gets it. `hover`
 * opens the anchored popover on a hover, and a fine pointer gets it when the
 * window is wide enough. `off` shows nothing: a fine pointer in a narrow
 * window keeps ordinary links, because a sheet far from the link loses the
 * hover on the way, and a click that opens a sheet swallows the navigation.
 */
export type Mode = 'sheet' | 'hover' | 'off';

/**
 * Reads the mode from the two queries. The sheet wins, so a device that
 * somehow matches both keeps one behavior.
 * @param sheetMatches - Whether the query of the sheet matches.
 * @param hoverMatches - Whether the query of the hover matches.
 */
export function modeOf( sheetMatches: boolean, hoverMatches: boolean ): Mode {
	if ( sheetMatches ) {
		return 'sheet';
	}

	return hoverMatches ? 'hover' : 'off';
}

/**
 * Tells whether the pointer stayed inside the link that it left. A link that
 * holds an inline child fires `pointerout` when the pointer crosses into that
 * child, and the visitor never left the link.
 * @param link    - The link of the event.
 * @param related - The related target of the pointer event.
 */
export function staysInLink(
	link: HTMLAnchorElement,
	related: EventTarget | null
): boolean {
	return related instanceof Node && link.contains( related );
}

/**
 * Tells whether the link sits inside the element that the configuration
 * names. The default keeps the popover on the links of the prose. A
 * selector that the browser rejects turns the whole feature off.
 * @param link     - The link of the event.
 * @param selector - The CSS selector of the container.
 */
function isInContainer( link: HTMLAnchorElement, selector: string ): boolean {
	try {
		return link.closest( selector ) !== null;
	} catch {
		return false;
	}
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

	if ( link === null || ! isInContainer( link, options.containerSelector ) ) {
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

// The support of the browser cannot change while the page lives, so the
// query runs once and every later placement reads the answer.
let anchorSupport: boolean | null = null;

function supportsAnchor(): boolean {
	if ( anchorSupport === null ) {
		// `window` typings claim `CSS` always exists, but an older browser
		// or a non-browser render target can leave it undefined. The cast
		// below widens the local type back to optional, so the check is
		// real.
		const css = ( window as { CSS?: typeof window.CSS } ).CSS;

		anchorSupport = css?.supports( 'anchor-name: --a' ) === true;
	}

	return anchorSupport;
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
	if ( supportsAnchor() ) {
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
