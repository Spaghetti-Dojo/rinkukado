import {
	initial,
	nextDeadline,
	reduce,
} from '../../../sources/client/preview/intent';
import type { Machine, Result } from '../../../sources/client/preview/intent';
import type { Timings } from '../../../sources/client/preview/types';

const timings: Timings = { prefetch: 80, open: 300, close: 200 };
const href = 'https://example.com/post/';

const enter = ( machine: Machine, at: number ): Result =>
	reduce( machine, { type: 'enter', href, at }, timings );

const tick = ( machine: Machine, at: number ): Result =>
	reduce( machine, { type: 'tick', at }, timings );

// eslint-disable-next-line max-lines-per-function
describe( 'reduce', () => {
	it( 'prefetches after the prefetch delay', () => {
		const entered = enter( initial, 1000 ).machine;

		expect( tick( entered, 1079 ).commands ).toEqual( [] );
		expect( tick( entered, 1080 ).commands ).toEqual( [
			{ type: 'prefetch', href },
		] );
	} );

	it( 'opens after the open delay', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1080 ).machine;

		const result = tick( machine, 1300 );

		expect( result.commands ).toEqual( [ { type: 'open', href } ] );
		expect( result.machine.phase ).toBe( 'open' );
	} );

	it( 'aborts when the pointer leaves before the popover opens', () => {
		const machine = enter( initial, 1000 ).machine;

		const result = reduce( machine, { type: 'leave', at: 1100 }, timings );

		expect( result.commands ).toEqual( [ { type: 'abort' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'closes after the close delay', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1300 ).machine;
		machine = reduce(
			machine,
			{ type: 'leave', at: 2000 },
			timings
		).machine;

		expect( tick( machine, 2199 ).commands ).toEqual( [] );

		const result = tick( machine, 2200 );

		expect( result.commands ).toEqual( [ { type: 'close' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'cancels the close when the pointer returns', () => {
		let machine = enter( initial, 1000 ).machine;
		machine = tick( machine, 1300 ).machine;
		machine = reduce(
			machine,
			{ type: 'leave', at: 2000 },
			timings
		).machine;
		machine = enter( machine, 2100 ).machine;

		expect( tick( machine, 2300 ).commands ).toEqual( [] );
		expect( machine.phase ).toBe( 'open' );
	} );

	it( 'opens on the first tap and stops the navigation', () => {
		const result = reduce( initial, { type: 'tap', href }, timings );

		expect( result.commands ).toEqual( [
			{ type: 'prefetch', href },
			{ type: 'open', href },
		] );
		expect( result.machine.phase ).toBe( 'open' );
	} );

	it( 'navigates on the second tap of the same link', () => {
		const machine = reduce(
			initial,
			{ type: 'tap', href },
			timings
		).machine;

		expect(
			reduce( machine, { type: 'tap', href }, timings ).commands
		).toEqual( [ { type: 'navigate', href } ] );
	} );

	it( 'opens the preview of another link on a tap', () => {
		const machine = reduce(
			initial,
			{ type: 'tap', href },
			timings
		).machine;
		const other = 'https://example.com/other/';

		expect(
			reduce( machine, { type: 'tap', href: other }, timings ).commands
		).toEqual( [
			{ type: 'prefetch', href: other },
			{ type: 'open', href: other },
		] );
	} );

	it( 'closes on escape', () => {
		const machine = reduce(
			initial,
			{ type: 'tap', href },
			timings
		).machine;

		const result = reduce( machine, { type: 'escape' }, timings );

		expect( result.commands ).toEqual( [ { type: 'close' } ] );
		expect( result.machine ).toEqual( initial );
	} );

	it( 'closes at once on a click outside', () => {
		const machine = reduce(
			initial,
			{ type: 'tap', href },
			timings
		).machine;

		expect(
			reduce( machine, { type: 'outside' }, timings ).commands
		).toEqual( [ { type: 'close' } ] );
	} );

	it( 'opens on focus like on hover', () => {
		const machine = reduce(
			initial,
			{ type: 'focus', href, at: 1000 },
			timings
		).machine;

		expect( tick( machine, 1300 ).commands ).toEqual( [
			{ type: 'open', href },
		] );
	} );
} );

describe( 'nextDeadline', () => {
	it( 'returns nothing when no timer runs', () => {
		expect( nextDeadline( initial ) ).toBeNull();
	} );

	it( 'returns the earliest deadline', () => {
		expect( nextDeadline( enter( initial, 1000 ).machine ) ).toBe( 1080 );
	} );
} );
