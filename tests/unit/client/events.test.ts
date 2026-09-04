import { bind } from '../../../sources/client/preview/events';
import { initial } from '../../../sources/client/preview/intent';

import type {
	EventContext,
	Refs,
} from '../../../sources/client/preview/context';
import type { IntentEvent } from '../../../sources/client/preview/intent';

type Harness = {
	context: EventContext;
	refs: Refs;
	sent: Array< IntentEvent >;
};

function createRefs(): Refs {
	return {
		bound: false,
		frame: null,
		dialog: null,
		closeButton: null,
		activeLink: null,
	};
}

function createHarness(): Harness {
	const sent: Array< IntentEvent > = [];
	const refs: Refs = createRefs();

	const context: EventContext = {
		refs,
		send: ( event ) => {
			sent.push( event );
		},
		machine: () => initial,
		isOpen: () => false,
		isSheet: () => false,
		policyOptions: () => ( {
			siteOrigin: 'http://localhost',
			homePath: '/',
			currentPath: '/current/',
			denyClass: 'rinkukado-no-preview',
		} ),
	};

	return { context, refs, sent };
}

function types( sent: Array< IntentEvent > ): Array< string > {
	return sent.map( ( event ) => event.type );
}

// eslint-disable-next-line max-lines-per-function
describe( 'the delegated listeners', () => {
	beforeEach( () => {
		window.matchMedia = jest.fn().mockReturnValue( { matches: false } );

		document.body.innerHTML =
			'<main id="root">' +
			'<a id="link" href="/post/one/">read <strong id="child">this</strong></a>' +
			'<span id="outside">outside</span>' +
			'</main>';
	} );

	it( 'sends no leave when the pointer crosses into a child of the link', () => {
		const harness = createHarness();
		const root = document.getElementById( 'root' )!;
		const link = document.getElementById( 'link' )!;
		const child = document.getElementById( 'child' )!;

		bind( root, harness.context );

		link.dispatchEvent(
			new MouseEvent( 'pointerout', {
				bubbles: true,
				relatedTarget: child,
			} )
		);

		expect( types( harness.sent ) ).not.toContain( 'leave' );
	} );

	it( 'sends leave when the pointer moves off the link', () => {
		const harness = createHarness();
		const root = document.getElementById( 'root' )!;
		const link = document.getElementById( 'link' )!;
		const outside = document.getElementById( 'outside' )!;

		bind( root, harness.context );

		link.dispatchEvent(
			new MouseEvent( 'pointerout', {
				bubbles: true,
				relatedTarget: outside,
			} )
		);

		expect( types( harness.sent ) ).toEqual( [ 'leave' ] );
	} );

	it( 'attaches nothing twice when init runs a second time', () => {
		const harness = createHarness();
		const root = document.getElementById( 'root' )!;
		const link = document.getElementById( 'link' )!;

		bind( root, harness.context );
		bind( root, harness.context );

		link.dispatchEvent(
			new MouseEvent( 'pointerover', { bubbles: true } )
		);

		expect( types( harness.sent ) ).toEqual( [ 'enter' ] );
	} );
} );
