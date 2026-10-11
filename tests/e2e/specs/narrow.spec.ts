import { expect, test } from '@wordpress/e2e-test-utils-playwright';

// A window below the medium breakpoint of WordPress, with a mouse. The
// project gives no popover here: a sheet at the bottom of the window loses
// the hover on the way to it, and a click that opens a sheet swallows the
// navigation that the visitor asked for.
test.use( { viewport: { width: 700, height: 700 } } );

function collectPreviewRequests( page: any, requests: Array< string > ): void {
	page.on( 'request', ( request: { url: () => string } ) => {
		if ( request.url().includes( 'rinkukado/v1/preview' ) ) {
			requests.push( request.url() );
		}
	} );
}

test.describe( 'a fine pointer in a narrow window', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'shows no popover on a hover', async ( { page } ) => {
		await page.hover( '#link-plain' );
		await page.waitForTimeout( 600 );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );

	test( 'asks the endpoint for nothing', async ( { page } ) => {
		const requests: Array< string > = [];

		collectPreviewRequests( page, requests );

		await page.hover( '#link-plain' );
		await page.waitForTimeout( 600 );

		expect( requests ).toHaveLength( 0 );
	} );
} );

test.describe( 'a click in a narrow window', () => {
	test( 'opens the article', async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
		await page.click( '#link-plain' );

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );
} );
