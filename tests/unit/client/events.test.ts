import { bind } from '../../../sources/client/preview/events';
import { initial } from '../../../sources/client/preview/intent';

import type {
	EventContext,
	Refs,
} from '../../../sources/client/preview/context';
import type {
	IntentEvent,
	Machine,
} from '../../../sources/client/preview/intent';
import type { Availability } from '../../../sources/client/preview/network';
import type { Mode } from '../../../sources/client/preview/dom';

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
		openLink: null,
		pendingTap: null,
	};
}

function createHarness( overrides: Partial< EventContext > = {} ): Harness {
	const sent: Array< IntentEvent > = [];
	const refs: Refs = createRefs();

	const context: EventContext = {
		refs,
		send: ( event ) => {
			sent.push( event );
		},
		machine: () => initial,
		isOpen: () => false,
		mode: (): Mode => 'hover',
		policyOptions: () => ( {
			siteOrigin: 'http://localhost',
			homePath: '/',
			currentPath: '/current/',
			denyClass: 'rinkukado-no-preview',
		} ),
		availability: (): Availability => 'unknown',
		...overrides,
	};

	return { context, refs, sent };
}

// Binds a harness to the root of the fixture, which every test shares.
function bindHarness( overrides: Partial< EventContext > = {} ): Harness {
	const harness = createHarness( overrides );
	const root = document.getElementById( 'root' )!;

	bind( root, harness.context );

	return harness;
}

function types( sent: Array< IntentEvent > ): Array< string > {
	return sent.map( ( event ) => event.type );
}

// The mode arrives through the context, so a test names the mode it needs
// rather than a media query.
function inMode( value: Mode ): Partial< EventContext > {
	return { mode: (): Mode => value };
}

function openMachine( linkHref: string ): Machine {
	return {
		phase: 'open',
		href: linkHref,
		prefetchAt: null,
		openAt: null,
		closeAt: null,
	};
}

function clickLink( link: Element ): MouseEvent {
	const event = new MouseEvent( 'click', {
		bubbles: true,
		cancelable: true,
	} );

	link.dispatchEvent( event );

	return event;
}

beforeEach( () => {
	document.body.innerHTML =
		'<main id="root">' +
		'<a id="link" href="/post/one/">read <strong id="child">this</strong></a>' +
		'<span id="outside">outside</span>' +
		'</main>';
} );

// eslint-disable-next-line max-lines-per-function
describe( 'the delegated listeners', () => {
	it( 'sends no leave when the pointer crosses into a child of the link', () => {
		const harness = bindHarness();
		const link = document.getElementById( 'link' )!;
		const child = document.getElementById( 'child' )!;

		link.dispatchEvent(
			new MouseEvent( 'pointerout', {
				bubbles: true,
				relatedTarget: child,
			} )
		);

		expect( types( harness.sent ) ).not.toContain( 'leave' );
	} );

	it( 'sends leave when the pointer moves off the link', () => {
		const harness = bindHarness();
		const link = document.getElementById( 'link' )!;
		const outside = document.getElementById( 'outside' )!;

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

	it( 'sends escape on Escape while the focus sits on body', () => {
		const harness = createHarness( { isOpen: (): boolean => true } );
		const root = document.getElementById( 'root' )!;

		bind( root, harness.context );
		document.body.focus();

		document.dispatchEvent(
			new KeyboardEvent( 'keydown', { key: 'Escape', bubbles: true } )
		);

		expect( types( harness.sent ) ).toEqual( [ 'escape' ] );
	} );
} );

describe( 'onClick of a href already known unavailable', () => {
	it( 'lets the tap navigate, without sending it to the machine', () => {
		const harness = bindHarness( {
			...inMode( 'sheet' ),
			availability: (): Availability => 'unavailable',
		} );
		const event = clickLink( document.getElementById( 'link' )! );

		expect( event.defaultPrevented ).toBe( false );
		expect( harness.sent ).toEqual( [] );
		expect( harness.refs.pendingTap ).toBeNull();
	} );
} );

describe( 'onClick in the sheet mode', () => {
	it( 'prevents the default and sends tap of a href not yet known', () => {
		const harness = bindHarness( inMode( 'sheet' ) );
		const link = document.getElementById( 'link' )! as HTMLAnchorElement;
		const event = clickLink( link );

		expect( event.defaultPrevented ).toBe( true );
		expect( types( harness.sent ) ).toEqual( [ 'tap' ] );
		expect( harness.refs.pendingTap ).toBe( link.href );
	} );

	it( 'prevents the default on the second tap, so only one path navigates', () => {
		const link = document.getElementById( 'link' )! as HTMLAnchorElement;
		const machine = (): Machine => openMachine( link.href );
		const harness = bindHarness( { ...inMode( 'sheet' ), machine } );
		const event = clickLink( link );

		expect( event.defaultPrevented ).toBe( true );
		expect( types( harness.sent ) ).toEqual( [ 'tap' ] );
	} );
} );

function pointerOverLink(): void {
	document
		.getElementById( 'link' )!
		.dispatchEvent( new MouseEvent( 'pointerover', { bubbles: true } ) );
}

// A fine pointer in a narrow window gets no popover at all. The links of the
// page must keep the behavior they hold without this plugin.
describe( 'the off mode and the pointer', () => {
	it( 'sends nothing when the pointer enters a link', () => {
		const harness = bindHarness( inMode( 'off' ) );

		pointerOverLink();

		expect( harness.sent ).toEqual( [] );
	} );
} );

describe( 'the off mode and a click', () => {
	it( 'lets a click navigate, and sends nothing', () => {
		const harness = bindHarness( inMode( 'off' ) );
		const event = clickLink( document.getElementById( 'link' )! );

		expect( event.defaultPrevented ).toBe( false );
		expect( harness.sent ).toEqual( [] );
		expect( harness.refs.pendingTap ).toBeNull();
	} );
} );

describe( 'the off mode and the keyboard', () => {
	it( 'sends nothing when a link takes the focus', () => {
		const harness = bindHarness( inMode( 'off' ) );

		document
			.getElementById( 'link' )!
			.dispatchEvent( new FocusEvent( 'focusin', { bubbles: true } ) );

		expect( harness.sent ).toEqual( [] );
	} );
} );

// The sheet mode never answers a hover, so a pointer that crosses a link
// leaves the page as it is.
describe( 'the sheet mode', () => {
	it( 'sends nothing when the pointer enters a link', () => {
		const harness = bindHarness( inMode( 'sheet' ) );

		pointerOverLink();

		expect( harness.sent ).toEqual( [] );
	} );
} );
