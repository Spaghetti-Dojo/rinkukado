import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import { devices } from '@playwright/test';

// The suite runs one project only, chromium, and the environment holds
// no webkit binary. `defaultBrowserType` of the device preset would pick
// webkit, so the test keeps the touch and viewport traits of the preset
// and drops that one field.
const { defaultBrowserType: _defaultBrowserType, ...iPad } =
	devices[ 'iPad (gen 7)' ];

test.use( { ...iPad } );

async function getScrollY( page: any ): Promise< number > {
	return page.evaluate( () => window.scrollY );
}

async function tapAndWaitForPreview(
	page: any,
	selector: string
): Promise< void > {
	const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
	await page.tap( selector );
	await response;
}

async function pollScrollY( page: any ): Promise< void > {
	await expect.poll( async () => getScrollY( page ) ).toBeGreaterThan( 0 );
}

test.describe( 'the sheet on a touch device', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'opens at the bottom on the first tap', async ( { page } ) => {
		await tapAndWaitForPreview( page, '#link-plain' );
		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;
		expect( box ).not.toBeNull();
		expect( box!.y + box!.height ).toBeCloseTo( height, 0 );
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );
	test( 'lets the page scroll while the sheet is open', async ( {
		page,
	} ) => {
		await tapAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.mouse.wheel( 0, 400 );
		await pollScrollY( page );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
	} );
} );

// The padding of the dialog must not add to its width, or the sheet reaches
// past the window and clips the thumbnail.
test.describe( 'the width of the sheet', () => {
	test( 'stays inside the window', async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
		await tapAndWaitForPreview( page, '#link-thumb' );

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const box = await dialog.boundingBox();
		const width = page.viewportSize()?.width ?? 0;

		expect( box ).not.toBeNull();
		expect( box!.x ).toBeGreaterThanOrEqual( 0 );
		expect( box!.x + box!.width ).toBeLessThanOrEqual( width );
	} );
} );

test.describe( 'the sheet navigation and closing', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'navigates on the second tap', async ( { page } ) => {
		await tapAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.tap( '#link-plain' );
		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );

	test( 'closes on the close button', async ( { page } ) => {
		await tapAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.getByRole( 'dialog' ).getByRole( 'button' ).tap();
		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await expect( page ).toHaveURL( /rinkukado-links/ );
	} );
} );

test.describe( 'a tap of a link whose preview fails', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	// The category endpoint answers 404: the preview is unavailable, and
	// the very first tap, whose result is not yet known, must still end
	// in a navigation, not in nothing. The navigation itself only fires
	// once the failed fetch settles, so the test waits for the URL
	// rather than racing the network response.
	test( 'navigates to the category page', async ( { page } ) => {
		await page.tap( '#link-category' );
		await page.waitForURL( /\/category\// );
	} );
} );
