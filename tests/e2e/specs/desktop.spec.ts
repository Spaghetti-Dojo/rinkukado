import { expect, test } from '@wordpress/e2e-test-utils-playwright';

const previewRequest = /rinkukado\/v1\/preview/;

function handlePreviewRequest(
	request: { url: () => string },
	requests: Array< string >
): void {
	if ( request.url().includes( 'rinkukado/v1/preview' ) ) {
		requests.push( request.url() );
	}
}

function trackPreviewRequests( page: any, requests: Array< string > ): void {
	page.on( 'request', ( request: { url: () => string } ) => {
		handlePreviewRequest( request, requests );
	} );
}

async function hoverAndWaitForPreview(
	page: any,
	selector: string
): Promise< void > {
	const response = page.waitForResponse( previewRequest );
	await page.hover( selector );
	await response;
}

test.describe( 'the popover on a desktop', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'shows the title, the excerpt and the thumbnail', async ( {
		page,
	} ) => {
		await hoverAndWaitForPreview( page, '#link-thumb' );
		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		await expect( dialog ).toContainText( 'A post with a thumbnail' );
		await expect( dialog ).toContainText( 'The excerpt of the post' );
		await expect( dialog.locator( '.rinkukado__media' ) ).toBeVisible();
		await expect( dialog ).toHaveClass( /rinkukado--with-media/ );
	} );
	test( 'uses one column when the post holds no thumbnail', async ( {
		page,
	} ) => {
		await hoverAndWaitForPreview( page, '#link-plain' );
		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		await expect( dialog ).not.toHaveClass( /rinkukado--with-media/ );
	} );
} );

test.describe( 'the popover positioning', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'stays inside the viewport near the bottom of the page', async ( {
		page,
	} ) => {
		await page.locator( '#link-bottom' ).scrollIntoViewIfNeeded();
		await hoverAndWaitForPreview( page, '#link-bottom' );
		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();
		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;
		expect( box ).not.toBeNull();
		expect( box!.y ).toBeGreaterThanOrEqual( 0 );
		expect( box!.y + box!.height ).toBeLessThanOrEqual( height );
	} );
} );

test.describe( 'the popover closing', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'closes when the pointer leaves', async ( { page } ) => {
		await hoverAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.mouse.move( 0, 0 );
		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );
	test( 'closes on escape', async ( { page } ) => {
		await hoverAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.keyboard.press( 'Escape' );
		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );
	test( 'goes to the article on a click of the title', async ( { page } ) => {
		await hoverAndWaitForPreview( page, '#link-plain' );
		await page.getByRole( 'dialog' ).locator( '.rinkukado__title' ).click();
		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
	} );
} );

test.describe( 'the popover restrictions', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'shows nothing for a category, a draft or the deny class', async ( {
		page,
	} ) => {
		for ( const selector of [
			'#link-category',
			'#link-draft',
			'#link-denied',
		] ) {
			await page.hover( selector );
			await page.waitForTimeout( 600 );
			await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		}
	} );
} );

test.describe( 'the popover request behavior', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );
	test( 'asks nothing for an external link', async ( { page } ) => {
		const requests: Array< string > = [];
		trackPreviewRequests( page, requests );
		await page.hover( '#link-external' );
		await page.waitForTimeout( 600 );
		expect( requests ).toHaveLength( 0 );
	} );
	test( 'asks once for the same link', async ( { page } ) => {
		const requests: Array< string > = [];
		trackPreviewRequests( page, requests );
		await hoverAndWaitForPreview( page, '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await page.mouse.move( 0, 0 );
		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		expect( requests ).toHaveLength( 1 );
	} );
} );
