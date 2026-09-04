import { expect, test } from '@wordpress/e2e-test-utils-playwright';

async function setupKeyboardTest( { page }: { page: any } ): Promise< void > {
	await page.goto( '/rinkukado-links/' );

	const response = page.waitForResponse( /rinkukado\/v1\/preview/ );
	await page.locator( '#link-plain' ).focus();
	await response;
}

test.describe( 'the keyboard path', () => {
	test( 'opens on focus, enters the dialog and returns on escape', async ( {
		page,
	} ) => {
		await setupKeyboardTest( { page } );

		const dialog = page.getByRole( 'dialog' );
		await expect( dialog ).toBeVisible();

		await expect( page.locator( '#link-plain' ) ).toHaveAttribute(
			'aria-describedby',
			'rinkukado-title'
		);

		await page.keyboard.press( 'Tab' );
		await expect( dialog.getByRole( 'button' ) ).toBeFocused();

		await page.keyboard.press( 'Escape' );
		await expect( dialog ).toBeHidden();
		await expect( page.locator( '#link-plain' ) ).toBeFocused();
	} );
} );
