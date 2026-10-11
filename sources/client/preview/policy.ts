/**
 * The policy of the preview. It decides from the facts of a link, without
 * the DOM, whether the link can show a preview.
 */

/**
 * The facts of a link that the decision needs. The DOM stays outside of the
 * decision, so the rules are testable without a document.
 */
export type LinkFacts = {
	href: string;
	target: string | null;
	hasDownload: boolean;
	classes: ReadonlyArray< string >;
};

/**
 * `homePath` and `currentPath` hold the path and the query of a page. A site
 * with plain links identifies a page by its query (`/?p=5`), so the path
 * alone cannot tell two pages apart.
 */
export type PolicyOptions = {
	siteOrigin: string;
	homePath: string;
	currentPath: string;
	denyClass: string;
	containerSelector: string;
};

const FILE_EXTENSION = /\.[a-z0-9]{2,5}$/i;

// The end of the path of the REST endpoint. A site with pretty links gives
// `wp-json/...`, and a site with plain links gives `index.php`.
const ENDPOINT_PATH = /(?:wp-json.*|index\.php)$/;

/**
 * Reads the path of the home page from the URL of the REST endpoint.
 * @param endpoint - The URL of the REST endpoint.
 */
export function homePathOf( endpoint: string ): string {
	return new URL( endpoint ).pathname.replace( ENDPOINT_PATH, '' );
}

function parseURL( href: string ): URL | null {
	try {
		return new URL( href );
	} catch {
		return null;
	}
}

function validateLinkAttributes(
	facts: LinkFacts,
	denyClass: string
): boolean {
	return (
		( facts.target === null || facts.target === '' ) &&
		! facts.hasDownload &&
		! facts.classes.includes( denyClass )
	);
}

function isHTTPProtocol( url: URL ): boolean {
	return url.protocol === 'http:' || url.protocol === 'https:';
}

function isValidPath( url: URL, options: PolicyOptions ): boolean {
	const page = url.pathname + url.search;

	return (
		page !== options.homePath &&
		page !== options.currentPath &&
		! FILE_EXTENSION.test( url.pathname )
	);
}

function validateURLProperties( url: URL, options: PolicyOptions ): boolean {
	return (
		isHTTPProtocol( url ) &&
		url.origin === options.siteOrigin &&
		isValidPath( url, options )
	);
}

export function factsFromLink( link: HTMLAnchorElement ): LinkFacts {
	return {
		href: link.href,
		target: link.getAttribute( 'target' ),
		hasDownload: link.hasAttribute( 'download' ),
		classes: Array.from( link.classList ),
	};
}

export function isPreviewable(
	facts: LinkFacts,
	options: PolicyOptions
): boolean {
	if ( ! validateLinkAttributes( facts, options.denyClass ) ) {
		return false;
	}

	const url: URL | null = parseURL( facts.href );

	if ( url === null ) {
		return false;
	}

	return validateURLProperties( url, options );
}
