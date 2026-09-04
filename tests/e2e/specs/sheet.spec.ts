import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { devices } from '@playwright/test';

// The suite runs one project only, chromium, and the environment holds
// no webkit binary. `defaultBrowserType` of the device preset would pick
// webkit, so the test keeps the touch and viewport traits of the preset
// and drops that one field.
const { defaultBrowserType: _defaultBrowserType, ...iPad } =
	devices[ 'iPad (gen 7)' ];

test.use( { ...iPad } );

test.describe( 'the sheet on a touch device', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'opens at the bottom on the first tap', async ( { page } ) => {
		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;

		expect( box ).not.toBeNull();
		expect( box!.y + box!.height ).toBeCloseTo( height, 0 );
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );

	test( 'lets the page scroll while the sheet is open', async ( { page } ) => {
		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.wheel( 0, 400 );

		// The browser applies the wheel after the call returns, so poll the
		// offset instead of one immediate read.
		await expect
			.poll( async () => page.evaluate( () => window.scrollY ) )
			.toBeGreaterThan( 0 );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
	} );

	test( 'navigates on the second tap', async ( { page } ) => {
		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.tap( '#link-plain' );

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );

	test( 'closes on the close button', async ( { page } ) => {
		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.getByRole( 'dialog' ).getByRole( 'button' ).tap();

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );
} );
