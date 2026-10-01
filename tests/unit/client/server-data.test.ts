import { server } from './interactivity-mock';
import {
	initializeServerConfig,
	initializeServerContext,
	initializeServerState,
	sanitize,
} from '../../../sources/client/interactivity/server-data';
import * as z from '../../../sources/client/interactivity/zod';

import type { Source } from '../../../sources/client/interactivity/server-data';

const STORE = 'my-plugin/counter';
const source: Source = { store: STORE, kind: 'config' };

const schema = z.strictObject( {
	label: z.string(),
	timings: z.strictObject( { open: z.int().check( z.nonnegative() ) } ),
} );

const valid = { label: 'Close', timings: { open: 300 } };

beforeEach( () => {
	server.config = {};
	server.state = {};
	server.context = {};
} );

it( 'returns the parsed value of valid data', () => {
	expect( sanitize( schema, valid, source ) ).toEqual( valid );
} );

it( 'names the store, the kind and the path of a wrong field', () => {
	const data = { label: 'Close', timings: { open: -1 } };

	expect( () => sanitize( schema, data, source ) ).toThrow(
		/^Store "my-plugin\/counter": the server config is not valid\.\n[\s\S]*→ at timings\.open/
	);
} );

it( 'names a key that the schema does not know', () => {
	const data = { ...valid, extra: true };

	expect( () => sanitize( schema, data, source ) ).toThrow(
		'Unrecognized key: "extra"'
	);
} );

it( 'throws an error that is not from Zod without a change', () => {
	const failure = new TypeError( 'boom' );
	const broken = {
		parse: (): never => {
			throw failure;
		},
	} as unknown as typeof schema;

	expect( () => sanitize( broken, valid, source ) ).toThrow( failure );
} );

it( 'reads the config of the store', () => {
	server.config[ STORE ] = valid;

	expect( initializeServerConfig( STORE, schema ) ).toEqual( valid );
} );

it( 'throws when the store has no config', () => {
	expect( () => initializeServerConfig( STORE, schema ) ).toThrow(
		'the server config is not valid'
	);
} );

it( 'writes the server state into the state', () => {
	const state = { count: 1 };
	server.state[ STORE ] = valid;

	initializeServerState( STORE, schema, state );

	expect( state ).toEqual( { count: 1, ...valid } );
} );

it( 'leaves the state unchanged when the server state is not valid', () => {
	const state = { count: 1 };
	server.state[ STORE ] = { label: 3 };

	expect( () => initializeServerState( STORE, schema, state ) ).toThrow(
		'the server state is not valid'
	);
	expect( state ).toEqual( { count: 1 } );
} );

it( 'writes the server context into the context', () => {
	const context = { open: false };
	server.context[ STORE ] = valid;

	initializeServerContext( STORE, schema, context );

	expect( context ).toEqual( { open: false, ...valid } );
} );

it( 'names the context when the server context is not valid', () => {
	expect( () => initializeServerContext( STORE, schema, {} ) ).toThrow(
		'the server context is not valid'
	);
} );
