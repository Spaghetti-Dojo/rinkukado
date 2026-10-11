import {
	homePathOf,
	isPreviewable,
} from '../../../sources/client/preview/policy';
import type {
	LinkFacts,
	PolicyOptions,
} from '../../../sources/client/preview/policy';

const options: PolicyOptions = {
	siteOrigin: 'https://example.com',
	homePath: '/',
	currentPath: '/blog/current-post/',
	denyClass: 'no-rinkukado',
	containerSelector: 'p',
};

// A site with plain links. The query identifies the page, not the path.
const plainOptions: PolicyOptions = { ...options, currentPath: '/?p=1' };

const facts = ( overrides: Partial< LinkFacts > = {} ): LinkFacts => ( {
	href: 'https://example.com/blog/other-post/',
	target: null,
	hasDownload: false,
	classes: [],
	...overrides,
} );

// eslint-disable-next-line max-lines-per-function
describe( 'isPreviewable', () => {
	it( 'accepts an internal link to another post', () => {
		expect( isPreviewable( facts(), options ) ).toBe( true );
	} );

	it( 'accepts a link that carries a class other than the deny class', () => {
		expect(
			isPreviewable( facts( { classes: [ 'wp-block-post' ] } ), options )
		).toBe( true );
	} );

	it( 'rejects another origin', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://other.test/post/' } ),
				options
			)
		).toBe( false );
	} );

	it( 'rejects a scheme that is not http', () => {
		expect(
			isPreviewable(
				facts( { href: 'mailto:someone@example.com' } ),
				options
			)
		).toBe( false );
	} );

	it( 'rejects the home page', () => {
		expect(
			isPreviewable( facts( { href: 'https://example.com/' } ), options )
		).toBe( false );
	} );

	it( 'rejects a link to the current page', () => {
		expect(
			isPreviewable(
				facts( {
					href: 'https://example.com/blog/current-post/#section',
				} ),
				options
			)
		).toBe( false );
	} );

	it( 'accepts the current path with another query', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/blog/current-post/?p=5' } ),
				options
			)
		).toBe( true );
	} );

	it( 'accepts a plain link to another post', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/?p=5' } ),
				plainOptions
			)
		).toBe( true );
	} );

	it( 'rejects a plain link to the current page', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/?p=1#section' } ),
				plainOptions
			)
		).toBe( false );
	} );

	it( 'rejects the home page of a site with plain links', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/' } ),
				plainOptions
			)
		).toBe( false );
	} );

	it( 'rejects a file', () => {
		expect(
			isPreviewable(
				facts( { href: 'https://example.com/report.pdf' } ),
				options
			)
		).toBe( false );
	} );

	it( 'rejects a link that opens a new tab', () => {
		expect( isPreviewable( facts( { target: '_blank' } ), options ) ).toBe(
			false
		);
	} );

	it( 'rejects a download', () => {
		expect( isPreviewable( facts( { hasDownload: true } ), options ) ).toBe(
			false
		);
	} );

	it( 'rejects the deny class', () => {
		expect(
			isPreviewable( facts( { classes: [ 'no-rinkukado' ] } ), options )
		).toBe( false );
	} );

	it( 'rejects an href that is not a URL', () => {
		expect( isPreviewable( facts( { href: '' } ), options ) ).toBe( false );
	} );
} );

describe( 'homePathOf', () => {
	it.each( [
		[ 'https://example.com/wp-json/rinkukado/v1/preview', '/' ],
		[ 'https://example.com/blog/wp-json/rinkukado/v1/preview', '/blog/' ],
		[
			'https://example.com/index.php?rest_route=/rinkukado/v1/preview',
			'/',
		],
		[
			'https://example.com/blog/index.php?rest_route=/rinkukado/v1/preview',
			'/blog/',
		],
	] )( 'reads the home path from %s', ( endpoint, homePath ) => {
		expect( homePathOf( endpoint ) ).toBe( homePath );
	} );
} );
