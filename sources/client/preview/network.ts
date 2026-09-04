import type { Preview } from './types';

/**
 * The three outcomes of a preview request.
 */
export type LoadResult = Preview | 'unavailable' | 'aborted';

/**
 * The values that the request needs from the server state.
 */
export type Endpoint = { url: string; nonce: string };

function hasPreviewFields( candidate: Record< string, unknown > ): boolean {
	return (
		typeof candidate[ 'id' ] === 'number' &&
		typeof candidate[ 'title' ] === 'string' &&
		typeof candidate[ 'excerpt' ] === 'string' &&
		typeof candidate[ 'permalink' ] === 'string'
	);
}

/**
 * Accepts only a payload that holds every field the dialog renders.
 * @param value - The decoded body of the response.
 */
export function readPreview( value: unknown ): Preview | null {
	if ( typeof value !== 'object' || value === null ) {
		return null;
	}

	const candidate = value as Record< string, unknown >;

	return hasPreviewFields( candidate )
		? ( candidate as unknown as Preview )
		: null;
}

function headersOf( nonce: string ): Record< string, string > {
	const headers: Record< string, string > = {};

	if ( nonce !== '' ) {
		headers[ 'X-WP-Nonce' ] = nonce;
	}

	return headers;
}

async function requestPreview(
	href: string,
	endpoint: Endpoint,
	signal: AbortSignal
): Promise< Preview | 'unavailable' > {
	const response = await window.fetch(
		`${ endpoint.url }?url=${ encodeURIComponent( href ) }`,
		{
			headers: headersOf( endpoint.nonce ),
			credentials: 'same-origin',
			signal,
		}
	);

	if ( ! response.ok ) {
		return 'unavailable';
	}

	const preview = readPreview( await response.json() );

	return preview ?? 'unavailable';
}

/**
 * Holds the cache and the abort control of the running request.
 */
export type Fetcher = {
	load: ( href: string, endpoint: Endpoint ) => Promise< LoadResult >;
	abort: () => void;
};

async function settle(
	href: string,
	endpoint: Endpoint,
	signal: AbortSignal
): Promise< LoadResult > {
	try {
		return await requestPreview( href, endpoint, signal );
	} catch ( error ) {
		if ( error instanceof DOMException && error.name === 'AbortError' ) {
			return 'aborted';
		}

		return 'unavailable';
	}
}

type FetchState = {
	cache: Map< string, Preview | 'unavailable' >;
	controller: AbortController | null;
};

async function loadWithCache(
	fetchState: FetchState,
	href: string,
	endpoint: Endpoint
): Promise< LoadResult > {
	const cached = fetchState.cache.get( href );

	if ( cached !== undefined ) {
		return cached;
	}

	fetchState.controller?.abort();
	fetchState.controller = new AbortController();

	const result = await settle( href, endpoint, fetchState.controller.signal );

	if ( result !== 'aborted' ) {
		fetchState.cache.set( href, result );
	}

	return result;
}

function abortFetch( fetchState: FetchState ): void {
	fetchState.controller?.abort();
	fetchState.controller = null;
}

/**
 * Builds a fetcher that caches every settled result for the page session.
 */
export function createFetcher(): Fetcher {
	const fetchState: FetchState = { cache: new Map(), controller: null };

	return {
		load: ( href, endpoint ) => loadWithCache( fetchState, href, endpoint ),
		abort: (): void => {
			abortFetch( fetchState );
		},
	};
}
