import { computePosition } from '../../../sources/client/preview/position';

const viewport = { width: 1000, height: 800 };
const popover = { width: 400, height: 200 };

// eslint-disable-next-line max-lines-per-function
describe( 'computePosition', () => {
	it( 'places the popover above the link when there is room', () => {
		const placement = computePosition(
			{ top: 400, left: 300, width: 100, height: 20 },
			popover,
			viewport
		);

		expect( placement.side ).toBe( 'above' );
		expect( placement.top ).toBe( 192 );
		expect( placement.left ).toBe( 150 );
	} );

	it( 'flips below when there is no room above', () => {
		const placement = computePosition(
			{ top: 40, left: 300, width: 100, height: 20 },
			popover,
			viewport
		);

		expect( placement.side ).toBe( 'below' );
		expect( placement.top ).toBe( 68 );
	} );

	it( 'shifts to the inline start edge', () => {
		const placement = computePosition(
			{ top: 400, left: 0, width: 60, height: 20 },
			popover,
			viewport
		);

		expect( placement.left ).toBe( 8 );
	} );

	it( 'shifts to the inline end edge', () => {
		const placement = computePosition(
			{ top: 400, left: 960, width: 40, height: 20 },
			popover,
			viewport
		);

		expect( placement.left ).toBe( 592 );
	} );

	it( 'keeps the popover inside a short viewport', () => {
		const placement = computePosition(
			{ top: 100, left: 300, width: 100, height: 20 },
			{ width: 400, height: 700 },
			{ width: 1000, height: 400 }
		);

		expect( placement.top ).toBe( 8 );
	} );
} );
