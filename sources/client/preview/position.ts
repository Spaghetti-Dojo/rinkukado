/**
 * The geometry of the popover. It computes the side and the position of the
 * popover from the rectangle of the link and the size of the viewport.
 */

export type Rect = { top: number; left: number; width: number; height: number };
export type Size = { width: number; height: number };
export type Viewport = { width: number; height: number };
export type Placement = { top: number; left: number; side: 'above' | 'below' };

export const MARGIN = 8;

function clamp( value: number, min: number, max: number ): number {
	if ( max < min ) {
		return min;
	}

	return Math.min( Math.max( value, min ), max );
}

/**
 * Places the popover near the link, inside the viewport.
 * Browsers that support CSS anchor positioning never call this function.
 *
 * @param anchor   - The element that the popover anchors to.
 * @param popover  - The popover dimensions.
 * @param viewport - The viewport dimensions.
 * @param gap      - The space between anchor and popover.
 * @return The placement with position and side.
 */
// eslint-disable-next-line @typescript-eslint/max-params
export function computePosition(
	anchor: Rect,
	popover: Size,
	viewport: Viewport,
	gap: number = MARGIN
): Placement {
	const spaceAbove = anchor.top;
	const spaceBelow = viewport.height - ( anchor.top + anchor.height );
	const needed = popover.height + gap;
	let side: 'above' | 'below' = 'above';
	if ( spaceAbove < needed ) {
		side =
			spaceBelow >= needed || spaceBelow > spaceAbove ? 'below' : 'above';
	}
	const top =
		side === 'above'
			? anchor.top - gap - popover.height
			: anchor.top + anchor.height + gap;
	const left = anchor.left + anchor.width / 2 - popover.width / 2;
	return {
		side,
		top: clamp( top, MARGIN, viewport.height - popover.height - MARGIN ),
		left: clamp( left, MARGIN, viewport.width - popover.width - MARGIN ),
	};
}
