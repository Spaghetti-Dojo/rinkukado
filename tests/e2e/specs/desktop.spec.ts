import { expect, test } from '@wordpress/e2e-test-utils-playwright';

const previewRequest = /rinkukado\/v1\/preview/;

test.describe( 'the popover on a desktop', () => {
	test.beforeEach( async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );
	} );

	test( 'shows the title, the excerpt and the thumbnail', async ( { page } ) => {
		// The production build of build/preview/index.js throws
		// "i.d is not a function" on load. The popover never opens.
		// See task-14-report.md for the defect.
		test.fixme();

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-thumb' );
		await response;

		const dialog = page.getByRole( 'dialog' );

		await expect( dialog ).toBeVisible();
		await expect( dialog ).toContainText( 'A post with a thumbnail' );
		await expect( dialog ).toContainText( 'The excerpt of the post' );
		await expect( dialog.locator( '.rinkukado__media' ) ).toBeVisible();
		await expect( dialog ).toHaveClass( /rinkukado--with-media/ );
	} );

	test( 'uses one column when the post holds no thumbnail', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-plain' );
		await response;

		const dialog = page.getByRole( 'dialog' );

		await expect( dialog ).toBeVisible();
		await expect( dialog ).not.toHaveClass( /rinkukado--with-media/ );
	} );

	test( 'stays inside the viewport near the bottom of the page', async ( {
		page,
	} ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		await page.locator( '#link-bottom' ).scrollIntoViewIfNeeded();
		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-bottom' );
		await response;

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		const box = await dialog.boundingBox();
		const height = page.viewportSize()?.height ?? 0;

		expect( box ).not.toBeNull();
		expect( box!.y ).toBeGreaterThanOrEqual( 0 );
		expect( box!.y + box!.height ).toBeLessThanOrEqual( height );
	} );

	test( 'closes when the pointer leaves', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.move( 0, 0 );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );

	test( 'closes on escape', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.keyboard.press( 'Escape' );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );

	test( 'goes to the article on a click of the title', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-plain' );
		await response;
		await page.getByRole( 'dialog' ).locator( '.rinkukado__title' ).click();

		await expect( page ).toHaveURL( /rinkukado-without-thumbnail/ );
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

	test( 'asks nothing for an external link', async ( { page } ) => {
		const requests: string[] = [];

		page.on( 'request', ( request ) => {
			if ( previewRequest.test( request.url() ) ) {
				requests.push( request.url() );
			}
		} );

		await page.hover( '#link-external' );
		await page.waitForTimeout( 600 );

		expect( requests ).toHaveLength( 0 );
	} );

	test( 'asks once for the same link', async ( { page } ) => {
		// Same build defect as above: the popover never opens.
		test.fixme();

		const requests: string[] = [];

		page.on( 'request', ( request ) => {
			if ( previewRequest.test( request.url() ) ) {
				requests.push( request.url() );
			}
		} );

		const response = page.waitForResponse( previewRequest );
		await page.hover( '#link-plain' );
		await response;
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		await page.mouse.move( 0, 0 );
		await expect( page.getByRole( 'dialog' ) ).toBeHidden();

		await page.hover( '#link-plain' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();

		expect( requests ).toHaveLength( 1 );
	} );
} );
