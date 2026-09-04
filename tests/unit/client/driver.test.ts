import { createDriver } from '../../../sources/client/preview/driver';

import type { Driver, Effects } from '../../../sources/client/preview/driver';
import type { Timings } from '../../../sources/client/preview/types';

const timings: Timings = { prefetch: 80, open: 300, close: 200 };

const A = 'https://example.com/a/';
const B = 'https://example.com/b/';

type Calls = {
	prefetch: Array< string | null >;
	open: Array< string | null >;
	close: Array< string | null >;
	abort: Array< string | null >;
	navigate: Array< string | null >;
};

// Builds one recorder per command, so each entry of `calls` fills on its
// own, without a shared block body per effect.
function recorder(
	calls: Calls,
	key: keyof Calls
): ( value: string | null ) => void {
	return ( value: string | null ): void => {
		calls[ key ].push( value );
	};
}

function createEffects(): { effects: Effects; calls: Calls } {
	const calls: Calls = {
		prefetch: [],
		open: [],
		close: [],
		abort: [],
		navigate: [],
	};

	const effects: Effects = {
		timings: () => timings,
		prefetch: recorder( calls, 'prefetch' ),
		open: recorder( calls, 'open' ),
		close: recorder( calls, 'close' ),
		abort: recorder( calls, 'abort' ),
		navigate: recorder( calls, 'navigate' ),
	};

	return { effects, calls };
}

function driverWith(): { calls: Calls; driver: Driver } {
	const { effects, calls } = createEffects();

	return { calls, driver: createDriver( effects ) };
}

// Enters A and lets it reach the open deadline, so a test can start from
// an already open popover.
function openLinkA(): { calls: Calls; driver: Driver } {
	const { calls, driver } = driverWith();

	driver.send( { type: 'enter', href: A, at: Date.now() } );
	jest.advanceTimersByTime( timings.open );

	return { calls, driver };
}

// A opens, the pointer leaves it, and B is hovered within the close
// delay of A.
function hoveredBAfterA(): { calls: Calls; driver: Driver } {
	const { calls, driver } = openLinkA();

	driver.send( { type: 'leave', at: Date.now() } );
	jest.advanceTimersByTime( 150 );
	driver.send( { type: 'enter', href: B, at: Date.now() } );

	return { calls, driver };
}

beforeEach( () => {
	jest.useFakeTimers();
	jest.setSystemTime( 1_000 );
} );

afterEach( () => {
	jest.useRealTimers();
} );

describe( 'createDriver opening', () => {
	it( 'opens a link after the open delay', () => {
		const { calls, driver } = openLinkA();

		expect( calls.open ).toEqual( [ A ] );
		expect( driver.machine().phase ).toBe( 'open' );
	} );
} );

/*
 * The exact sequence of the critical defect: A opens, the pointer leaves
 * A and starts its 200 ms close, B is hovered inside that window, and B
 * is left before its own 300 ms open. Every step that leaves the open
 * phase must run a close, and the machine must never hold a phase the
 * DOM disagrees with.
 */
describe( 'createDriver closing a stale popover', () => {
	it( 'closes A at once, before its own close delay elapses, once B is hovered', () => {
		const { calls, driver } = hoveredBAfterA();

		expect( calls.close ).toEqual( [ A ] );
		expect( driver.machine().href ).toBe( B );
	} );

	it( 'stays idle once B is left before it opens, so a stray Escape closes nothing again', () => {
		const { calls, driver } = hoveredBAfterA();

		jest.advanceTimersByTime( 100 );
		driver.send( { type: 'leave', at: Date.now() } );
		driver.send( { type: 'escape' } );

		// B never opened, so only its abort ran. A closed once, not twice.
		expect( calls.abort ).toEqual( [ B ] );
		expect( driver.machine().phase ).toBe( 'idle' );
		expect( calls.close ).toEqual( [ A ] );
	} );
} );

describe( 'createDriver clearing timers', () => {
	it( 'clears every deadline once the machine is idle again', () => {
		const { calls, driver } = driverWith();

		driver.send( { type: 'enter', href: A, at: Date.now() } );
		driver.send( { type: 'leave', at: Date.now() } );
		jest.advanceTimersByTime( 10_000 );

		expect( calls.abort ).toEqual( [ A ] );
		expect( calls.open ).toEqual( [] );
		expect( calls.close ).toEqual( [] );
	} );
} );

describe( 'createDriver tapping', () => {
	it( 'closes the old link when a tap opens another link', () => {
		const { calls, driver } = driverWith();

		driver.send( { type: 'tap', href: A } );
		driver.send( { type: 'tap', href: B } );

		expect( calls.close ).toEqual( [ A ] );
		expect( calls.open ).toEqual( [ A, B ] );
		expect( driver.machine().href ).toBe( B );
	} );
} );

describe( 'createDriver on an unavailable preview', () => {
	it( 'resets through send when the open preview turns out unavailable', () => {
		const { calls, driver } = driverWith();

		driver.send( { type: 'tap', href: A } );
		driver.send( { type: 'unavailable', href: A } );

		expect( calls.close ).toEqual( [ A ] );
		expect( driver.machine().phase ).toBe( 'idle' );
	} );

	it( 'ignores an unavailable result of a href the visitor already left', () => {
		const { calls, driver } = driverWith();

		driver.send( { type: 'tap', href: A } );
		driver.send( { type: 'tap', href: B } );
		calls.close.length = 0;
		driver.send( { type: 'unavailable', href: A } );

		expect( calls.close ).toEqual( [] );
		expect( driver.machine().href ).toBe( B );
	} );
} );
