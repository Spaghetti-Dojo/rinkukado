import {
	readPreview,
	resolveRoot,
} from '../../../sources/client/preview/index.module';

describe( 'resolveRoot', () => {
	it( 'finds the root of the selector', () => {
		document.body.innerHTML = '<main id="content"></main>';

		expect( resolveRoot( document, 'main' ) ).toBe(
			document.getElementById( 'content' )
		);
	} );

	it( 'returns nothing when the selector matches no element', () => {
		document.body.innerHTML = '<div></div>';

		expect( resolveRoot( document, 'main' ) ).toBeNull();
	} );

	it( 'returns nothing when the selector is not valid', () => {
		document.body.innerHTML = '<main></main>';

		expect( resolveRoot( document, '::::' ) ).toBeNull();
	} );
} );

describe( 'readPreview', () => {
	it( 'accepts a payload of the endpoint', () => {
		const payload = {
			id: 7,
			title: 'The title',
			excerpt: 'The excerpt',
			permalink: 'https://example.com/post/',
			thumbnail: null,
		};

		expect( readPreview( payload ) ).toEqual( payload );
	} );

	it( 'refuses a payload without a title', () => {
		expect(
			readPreview( { id: 7, permalink: 'https://example.com/' } )
		).toBeNull();
	} );

	it( 'refuses a value that is not an object', () => {
		expect( readPreview( 'nope' ) ).toBeNull();
	} );
} );
