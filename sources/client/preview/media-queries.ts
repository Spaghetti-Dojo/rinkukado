/**
 * The watcher of the media queries. It reports the mode of the feature at
 * the start and again at each rotation or resize.
 */

import { modeOf } from './dom';

import type { Mode } from './dom';

/**
 * Reports the mode now and again on every rotation and resize, not only at
 * the moment the popover opens.
 * @param sheetQuery - The media query of the sheet.
 * @param hoverQuery - The media query of the hover.
 * @param onChange   - Receives the mode at each change.
 */
export function watchQueries(
	sheetQuery: string,
	hoverQuery: string,
	onChange: ( mode: Mode ) => void
): void {
	const sheet = window.matchMedia( sheetQuery );
	const hover = window.matchMedia( hoverQuery );

	const apply = (): void => {
		onChange( modeOf( sheet.matches, hover.matches ) );
	};

	apply();

	sheet.addEventListener( 'change', apply );
	hover.addEventListener( 'change', apply );
}
