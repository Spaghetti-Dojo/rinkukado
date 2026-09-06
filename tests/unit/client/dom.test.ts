import { modeOf } from '../../../sources/client/preview/dom';

describe( 'modeOf', () => {
	it( 'gives the sheet to a coarse pointer', () => {
		expect( modeOf( true, false ) ).toBe( 'sheet' );
	} );

	it( 'gives the hover to a fine pointer in a wide window', () => {
		expect( modeOf( false, true ) ).toBe( 'hover' );
	} );

	it( 'gives nothing to a fine pointer in a narrow window', () => {
		expect( modeOf( false, false ) ).toBe( 'off' );
	} );

	it( 'keeps one behavior when both queries match', () => {
		expect( modeOf( true, true ) ).toBe( 'sheet' );
	} );
} );
