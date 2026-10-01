import {
	configSchema,
	stateSchema,
} from '../../../sources/client/preview/schemas';

// The shape of PopoverRegion::clientConfig().
const config = {
	endpoint: 'https://example.com/wp-json/rinkukado/v1/preview',
	nonce: 'abc123',
	rootSelector: 'main',
	containerSelector: '.entry-content',
	denyClass: 'no-rinkukado',
	timings: { prefetch: 80, open: 300, close: 200 },
	sheetQuery: '(pointer: coarse)',
	hoverQuery: '(hover: hover) and (pointer: fine) and (min-width: 782px)',
};

// The shape of PopoverRegion::state().
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

function accepts( data: unknown ): boolean {
	return configSchema.safeParse( data ).success;
}

it( 'accepts the config of the server', () => {
	expect( accepts( config ) ).toBe( true );
} );

it( 'accepts an empty nonce for a visitor who is not logged in', () => {
	expect( accepts( { ...config, nonce: '' } ) ).toBe( true );
} );

it( 'accepts a timing of zero', () => {
	const timings = { prefetch: 0, open: 0, close: 0 };

	expect( accepts( { ...config, timings } ) ).toBe( true );
} );

it( 'rejects a key that the server does not send', () => {
	expect( accepts( { ...config, extra: 1 } ) ).toBe( false );
} );

it( 'rejects a negative timing', () => {
	const timings = { ...config.timings, open: -1 };

	expect( accepts( { ...config, timings } ) ).toBe( false );
} );

it( 'rejects a timing that is not an integer', () => {
	const timings = { ...config.timings, close: 1.5 };

	expect( accepts( { ...config, timings } ) ).toBe( false );
} );

it( 'rejects an endpoint that is not a URL', () => {
	expect( accepts( { ...config, endpoint: 'nope' } ) ).toBe( false );
} );

it( 'rejects an endpoint with a scheme that is not http', () => {
	const endpoint = 'javascript:alert(1)';

	expect( accepts( { ...config, endpoint } ) ).toBe( false );
} );

it( 'rejects an empty selector', () => {
	expect( accepts( { ...config, rootSelector: '' } ) ).toBe( false );
} );

it( 'accepts the state of the server', () => {
	expect( stateSchema.safeParse( state ).success ).toBe( true );
} );

it( 'rejects a state without a label', () => {
	const { closeLabel, ...rest } = state;

	expect( stateSchema.safeParse( rest ).success ).toBe( false );
} );
