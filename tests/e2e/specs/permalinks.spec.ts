import { expect, test } from '@wordpress/e2e-test-utils-playwright';

const previewRequest = /rinkukado(?:\/|%2F)v1(?:\/|%2F)preview/;

// The fixtures give plain permalinks to a request that carries this cookie.
const PLAIN_COOKIE = 'rinkukado_plain_permalinks';

type Structure = {
	name: string;
	plain: boolean;
	path: string;
	link: RegExp;
	endpoint: RegExp;
};

const structures: Array< Structure > = [
	{
		name: 'pretty',
		plain: false,
		path: '/rinkukado-links/',
		link: /\/rinkukado-with-thumbnail\/$/,
		endpoint: /\/wp-json\/rinkukado\/v1\/preview\?/,
	},
	{
		name: 'plain',
		plain: true,
		path: '/?pagename=rinkukado-plain-links',
		link: /\/\?p=\d+$/,
		endpoint: /\/index\.php\?rest_route=/,
	},
];

async function setPlainPermalinks(
	context: any,
	baseURL: string | undefined
): Promise< void > {
	await context.addCookies( [
		{ name: PLAIN_COOKIE, value: '1', url: baseURL },
	] );
}

async function open(
	page: any,
	context: any,
	structure: Structure
): Promise< void > {
	if ( structure.plain ) {
		await setPlainPermalinks( context, test.info().project.use.baseURL );
	}

	await page.goto( structure.path );
}

async function expectPreview(
	page: any,
	structure: Structure
): Promise< void > {
	// The site must give the links and the endpoint of the structure, or the
	// test proves nothing about it.
	await expect( page.locator( '#link-thumb' ) ).toHaveAttribute(
		'href',
		structure.link
	);

	const pending = page.waitForResponse( previewRequest );
	await page.hover( '#link-thumb' );
	const response = await pending;

	expect( response.url() ).toMatch( structure.endpoint );
	expect( response.status() ).toBe( 200 );

	const dialog = page.getByRole( 'dialog' );
	await expect( dialog ).toBeVisible();
	await expect( dialog ).toContainText( 'A post with a thumbnail' );
}

for ( const structure of structures ) {
	test.describe( `the popover with ${ structure.name } permalinks`, () => {
		test( 'shows the preview of a link', async ( { page, context } ) => {
			await open( page, context, structure );
			await expectPreview( page, structure );
		} );
	} );
}

test.describe( 'a link to the current page with plain permalinks', () => {
	test( 'shows no popover', async ( { page, context, baseURL } ) => {
		await setPlainPermalinks( context, baseURL );

		// The link holds the plain URL of the page: `/?page_id=<id>`.
		await page.goto( '/?pagename=rinkukado-plain-links' );
		const self = await page.getAttribute( '#link-self', 'href' );
		await page.goto( self ?? '' );

		await page.hover( '#link-self' );
		await page.waitForTimeout( 600 );

		await expect( page.getByRole( 'dialog' ) ).toBeHidden();
	} );
} );
