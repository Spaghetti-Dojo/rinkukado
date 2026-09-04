import { isPreviewable } from '../../../sources/client/preview/policy';
import type {
	LinkFacts,
	PolicyOptions,
} from '../../../sources/client/preview/policy';

const options: PolicyOptions = {
	siteOrigin: 'https://example.com',
	homePath: '/',
	currentPath: '/blog/current-post/',
	denyClass: 'no-rinkukado',
};

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

	it( 'accepts a link that carries rel nofollow, which the facts ignore', () => {
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
