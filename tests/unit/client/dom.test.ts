import { modeOf, previewableLink } from '../../../sources/client/preview/dom';

import type { PolicyOptions } from '../../../sources/client/preview/policy';

describe( 'modeOf', () => {
	it( 'gives the sheet to a coarse pointer', () => {
		expect( modeOf( true, false ) ).toBe( 'sheet' );
	} );

	it( 'gives the hover to a fine pointer in a wide window', () => {
		expect( modeOf( false, true ) ).toBe( 'hover' );
	} );

	it( 'gives nothing to a fine pointer in a narrow window', () => {
		expect( modeOf( false, false ) ).toBe( 'off' );
	} );

	it( 'keeps one behavior when both queries match', () => {
		expect( modeOf( true, true ) ).toBe( 'sheet' );
	} );
} );

const options: PolicyOptions = {
	siteOrigin: 'http://localhost',
	homePath: '/',
	currentPath: '/current/',
	denyClass: 'no-rinkukado',
	containerSelector: 'p',
};

// eslint-disable-next-line max-lines-per-function
describe( 'previewableLink', () => {
	it( 'accepts a link inside a paragraph', () => {
		document.body.innerHTML =
			'<p><a id="link" href="http://localhost/post/one/">one</a></p>';

		const link = document.getElementById( 'link' )!;

		expect( previewableLink( link, options ) ).toBe( link );
	} );

	it( 'refuses a link outside of a paragraph', () => {
		document.body.innerHTML =
			'<div class="wp-block-post-date">' +
			'<a id="link" href="http://localhost/post/one/">the date</a>' +
			'</div>';

		const link = document.getElementById( 'link' )!;

		expect( previewableLink( link, options ) ).toBeNull();
	} );

	it( 'refuses every link when the container selector is invalid', () => {
		document.body.innerHTML =
			'<p><a id="link" href="http://localhost/post/one/">one</a></p>';

		const link = document.getElementById( 'link' )!;

		expect(
			previewableLink( link, { ...options, containerSelector: ')(' } )
		).toBeNull();
	} );
} );
