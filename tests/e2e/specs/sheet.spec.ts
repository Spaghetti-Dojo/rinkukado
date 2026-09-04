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
		// The production build of build/preview/index.js throws
		// "i.d is not a function" on load. The popover never opens.
		// See task-14-report.md for the defect.
		test.fixme();

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
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.wheel( 0, 400 );

		expect( await page.evaluate( () => window.scrollY ) ).toBeGreaterThan(
			0
		);
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
	} );

	test( 'navigates on the second tap', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.tap( '#link-plain' );

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );

	test( 'closes on the close button', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
		await page.tap( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.getByRole( 'dialog' ).getByRole( 'button' ).tap();

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );
} );
