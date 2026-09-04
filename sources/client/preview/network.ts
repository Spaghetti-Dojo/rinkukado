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
 * Holds the cache, and the requests that are in flight, of one page session.
 */
export type Fetcher = {
	load: ( href: string, endpoint: Endpoint ) => Promise< LoadResult >;
	abort: ( href: string | null ) => void;
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

type Pending = {
	controller: AbortController;
	promise: Promise< LoadResult >;
};

type FetchState = {
	cache: Map< string, Preview | 'unavailable' >;
	pending: Map< string, Pending >;
};

// Records the outcome of a request and frees its slot. An abort leaves no
// mark, so a later visit of the same link can try again.
function keepResult(
	fetchState: FetchState,
	href: string,
	result: LoadResult
): LoadResult {
	fetchState.pending.delete( href );

	if ( result !== 'aborted' ) {
		fetchState.cache.set( href, result );
	}

	return result;
}

function startRequest(
	fetchState: FetchState,
	href: string,
	endpoint: Endpoint
): Pending {
	const controller = new AbortController();

	const promise = settle( href, endpoint, controller.signal ).then(
		( result ) => keepResult( fetchState, href, result )
	);

	const pending: Pending = { controller, promise };

	fetchState.pending.set( href, pending );

	return pending;
}

// A second call for a href that is already in flight awaits the same
// promise, so one link never starts two requests.
async function loadWithCache(
	fetchState: FetchState,
	href: string,
	endpoint: Endpoint
): Promise< LoadResult > {
	const cached = fetchState.cache.get( href );

	if ( cached !== undefined ) {
		return cached;
	}

	const inFlight = fetchState.pending.get( href );

	if ( inFlight !== undefined ) {
		return inFlight.promise;
	}

	return startRequest( fetchState, href, endpoint ).promise;
}

// Aborts the request of one href only. The requests of the other links
// stay untouched.
function abortFetch( fetchState: FetchState, href: string | null ): void {
	if ( href === null ) {
		return;
	}

	const pending = fetchState.pending.get( href );

	if ( pending === undefined ) {
		return;
	}

	fetchState.pending.delete( href );
	pending.controller.abort();
}

/**
 * Builds a fetcher that caches every settled result for the page session.
 */
export function createFetcher(): Fetcher {
	const fetchState: FetchState = { cache: new Map(), pending: new Map() };

	return {
		load: ( href, endpoint ) => loadWithCache( fetchState, href, endpoint ),
		abort: ( href ): void => {
			abortFetch( fetchState, href );
		},
	};
}
