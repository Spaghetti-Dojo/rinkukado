type Definition = {
	state: Record< string, unknown >;
	callbacks: { init: () => void };
};

const config = {
	endpoint: 'https://example.com/wp-json/rinkukado/v1/preview',
	nonce: '',
	rootSelector: 'main',
	containerSelector: '.entry-content',
	denyClass: 'no-rinkukado',
	timings: { prefetch: 80, open: 300, close: 200 },
	sheetQuery: '(pointer: coarse)',
	hoverQuery: '(hover: hover) and (pointer: fine) and (min-width: 782px)',
};

const state = {
	closeLabel: 'Close the preview',
	ctaLabel: 'Read the article',
	isOpen: false,
	isSheet: false,
	hasThumbnail: false,
	title: '',
	excerpt: '',
	permalink: '',
	thumbnailSrc: '',
	thumbnailSrcset: '',
	thumbnailAlt: '',
};

// Loads a fresh copy of the store, so the cache of one test does not leak
// into the next one.
async function load(
	serverConfig: unknown,
	serverState: unknown
): Promise< Definition > {
	jest.resetModules();

	const mock = await import( './interactivity-mock' );
	mock.server.config[ 'rinkukado' ] = serverConfig;
	mock.server.state[ 'rinkukado' ] = serverState;

	await import( '../../../sources/client/preview/index.module' );

	return mock.stores.get( 'rinkukado' ) as Definition;
}

function root(): HTMLElement {
	return document.querySelector< HTMLElement >( 'main' )!;
}

beforeEach( () => {
	document.body.innerHTML =
		'<main><a href="/a/">A</a></main>' +
		'<div class="rinkukado"><div class="rinkukado__dialog">' +
		'<button class="rinkukado__close"></button></div></div>';

	window.matchMedia = jest.fn( () => ( {
		matches: false,
		addEventListener: jest.fn(),
	} ) ) as unknown as typeof window.matchMedia;
} );

it( 'binds nothing when the config is not valid', async () => {
	const endpoint = 'javascript:alert(1)';
	const definition = await load( { ...config, endpoint }, state );
	const listen = jest.spyOn( root(), 'addEventListener' );

	expect( () => {
		definition.callbacks.init();
	} ).toThrow( 'the server config is not valid' );
	expect( window.matchMedia ).not.toHaveBeenCalled();
	expect( listen ).not.toHaveBeenCalled();
} );

it( 'binds nothing and keeps no config when the state is not valid', async () => {
	const definition = await load( config, { ...state, isOpen: 'no' } );

	expect( () => {
		definition.callbacks.init();
	} ).toThrow( 'the server state is not valid' );
	expect( () => {
		definition.callbacks.init();
	} ).toThrow( 'the server state is not valid' );
	expect( window.matchMedia ).not.toHaveBeenCalled();
} );

it( 'binds the listeners when the data is valid', async () => {
	const definition = await load( config, state );
	const listen = jest.spyOn( root(), 'addEventListener' );

	definition.callbacks.init();

	expect( listen ).toHaveBeenCalled();
	expect( definition.state.closeLabel ).toBe( 'Close the preview' );
} );

it( 'keeps the state when init runs a second time', async () => {
	const definition = await load( config, state );

	definition.callbacks.init();
	definition.state.isOpen = true;
	definition.callbacks.init();

	expect( definition.state.isOpen ).toBe( true );
} );
