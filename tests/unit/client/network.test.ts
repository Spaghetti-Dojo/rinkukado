import {
	createFetcher,
	requestURL,
} from '../../../sources/client/preview/network';

import type { Endpoint } from '../../../sources/client/preview/network';

const ENDPOINT: Endpoint = {
	url: 'https://example.com/wp-json/rinkukado/v1/preview',
	nonce: 'abc',
};

const FIRST = 'https://example.com/post/one/';
const SECOND = 'https://example.com/post/two/';

const payload = {
	id: 7,
	title: 'The title',
	excerpt: 'The excerpt',
	permalink: FIRST,
	thumbnail: null,
};

type Resolver = ( body: unknown ) => void;

type FetchDouble = {
	calls: () => number;
	resolve: ( index: number, body: unknown ) => void;
};

// Keeps one request open until the test resolves it, or until the signal
// of that request aborts it.
function openRequest(
	resolvers: Array< Resolver >,
	init: { signal: AbortSignal }
): Promise< unknown > {
	return new Promise( ( resolve, reject ) => {
		resolvers.push( ( body: unknown ) => {
			resolve( { ok: true, json: () => Promise.resolve( body ) } );
		} );

		init.signal.addEventListener( 'abort', () => {
			reject( new DOMException( 'Aborted', 'AbortError' ) );
		} );
	} );
}

// Replaces window.fetch with a double that opens one request per call.
function installFetch(): FetchDouble {
	const resolvers: Array< Resolver > = [];

	const fetchMock = jest.fn(
		( _url: string, init: { signal: AbortSignal } ) =>
			openRequest( resolvers, init )
	);

	window.fetch = fetchMock as unknown as typeof window.fetch;

	return {
		calls: (): number => fetchMock.mock.calls.length,
		resolve: ( index: number, body: unknown ): void => {
			resolvers[ index ]?.( body );
		},
	};
}

// eslint-disable-next-line max-lines-per-function
describe( 'createFetcher', () => {
	it( 'shares one request between two loads of the same href', async () => {
		const double = installFetch();
		const fetcher = createFetcher();

		const first = fetcher.load( FIRST, ENDPOINT );
		const second = fetcher.load( FIRST, ENDPOINT );

		double.resolve( 0, payload );

		expect( await first ).toEqual( payload );
		expect( await second ).toEqual( payload );
		expect( double.calls() ).toBe( 1 );
	} );

	it( 'aborts one href and leaves the other href alone', async () => {
		const double = installFetch();
		const fetcher = createFetcher();

		const first = fetcher.load( FIRST, ENDPOINT );
		const second = fetcher.load( SECOND, ENDPOINT );

		fetcher.abort( FIRST );

		expect( await first ).toBe( 'aborted' );

		double.resolve( 1, { ...payload, permalink: SECOND } );

		expect( await second ).toEqual( { ...payload, permalink: SECOND } );
		expect( double.calls() ).toBe( 2 );
	} );

	it( 'leaves no mark after an abort, so the href can load again', async () => {
		const double = installFetch();
		const fetcher = createFetcher();

		const first = fetcher.load( FIRST, ENDPOINT );

		fetcher.abort( FIRST );

		expect( await first ).toBe( 'aborted' );

		const second = fetcher.load( FIRST, ENDPOINT );

		double.resolve( 1, payload );

		expect( await second ).toEqual( payload );
		expect( double.calls() ).toBe( 2 );
	} );

	it( 'marks the href unavailable after an invalid payload', async () => {
		const double = installFetch();
		const fetcher = createFetcher();

		const first = fetcher.load( FIRST, ENDPOINT );

		double.resolve( 0, { id: 7 } );

		expect( await first ).toBe( 'unavailable' );
		expect( await fetcher.load( FIRST, ENDPOINT ) ).toBe( 'unavailable' );
		expect( double.calls() ).toBe( 1 );
	} );
} );

describe( 'requestURL', () => {
	it( 'adds the href to an endpoint without a query', () => {
		expect( requestURL( FIRST, ENDPOINT.url ) ).toBe(
			'https://example.com/wp-json/rinkukado/v1/preview?url=https%3A%2F%2Fexample.com%2Fpost%2Fone%2F'
		);
	} );

	// A site with plain links gives an endpoint that already holds a query.
	it( 'keeps the query of the endpoint', () => {
		const url = new URL(
			requestURL(
				'https://example.com/?p=5',
				'https://example.com/index.php?rest_route=/rinkukado/v1/preview'
			)
		);

		expect( url.searchParams.get( 'rest_route' ) ).toBe(
			'/rinkukado/v1/preview'
		);
		expect( url.searchParams.get( 'url' ) ).toBe(
			'https://example.com/?p=5'
		);
	} );
} );
