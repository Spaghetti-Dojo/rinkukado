import { expect, test } from '@wordpress/e2e-test-utils-playwright';

// The pointer moves from an open popover to the next link. The dialog must
// follow the second link, because the close of the first one runs inside the
// event of the second one.
type Anchors = {
	describedBy: Array< string >;
	anchorNameOn: Array< string >;
};

async function anchorsOf( page: any ): Promise< Anchors > {
	return page.evaluate( () => ( {
		describedBy: Array.from(
			document.querySelectorAll( 'a[aria-describedby]' )
		).map( ( link ) => link.id ),
		anchorNameOn: Array.from( document.querySelectorAll( 'a' ) )
			.filter(
				( link ) =>
					( link as HTMLAnchorElement ).style.getPropertyValue(
						'anchor-name'
					) !== ''
			)
			.map( ( link ) => link.id ),
	} ) );
}

async function expectAnchoredTo( page: any, id: string ): Promise< void > {
	const anchors = await anchorsOf( page );

	expect( anchors ).toEqual( {
		describedBy: [ id ],
		anchorNameOn: [ id ],
	} );
}

test.describe( 'the move from one link to the next', () => {
	test( 'anchors the popover to the second link', async ( { page } ) => {
		await page.goto( '/rinkukado-links/' );

		await page.hover( '#link-thumb' );
		await expect( page.getByRole( 'dialog' ) ).toBeVisible();
		await expectAnchoredTo( page, 'link-thumb' );

		await page.hover( '#link-plain' );
		await expect(
			page.getByRole( 'dialog' ).locator( '.rinkukado__title' )
		).toHaveText( 'A post without a thumbnail' );
		await expectAnchoredTo( page, 'link-plain' );
	} );
} );
