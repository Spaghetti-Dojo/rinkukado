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

export type PolicyOptions = {
	siteOrigin: string;
	homePath: string;
	currentPath: string;
	denyClass: string;
};

const FILE_EXTENSION = /\.[a-z0-9]{2,5}$/i;

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

function isValidPath( pathname: string, options: PolicyOptions ): boolean {
	return (
		pathname !== options.homePath &&
		pathname !== options.currentPath &&
		! FILE_EXTENSION.test( pathname )
	);
}

function validateURLProperties( url: URL, options: PolicyOptions ): boolean {
	return (
		isHTTPProtocol( url ) &&
		url.origin === options.siteOrigin &&
		isValidPath( url.pathname, options )
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
